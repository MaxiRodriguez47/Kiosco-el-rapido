import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import type { Product } from "../types";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  items?: Product[];
};

type Reply = {
  text: string;
  items?: Product[];
};

type Intent = {
  keywords: string[];
  answer: string;
};

// Respuestas fijas del bot. Para agregar o cambiar una, editá estos arreglos.
// keywords: palabras (sin tildes y en minúscula) que activan la respuesta.
// Una palabra sola coincide con el comienzo de cualquier palabra del mensaje.
// Una frase con espacios tiene que aparecer completa.

// Se evalúan primero, antes de buscar productos.
const SPECIFIC_INTENTS: Intent[] = [
  {
    keywords: ["transferencia", "descuento", "10%"],
    answer:
      "Si pagás por transferencia bancaria tenés un 10% de descuento. También aceptamos efectivo.",
  },
  {
    keywords: ["pago", "pagar", "efectivo", "tarjeta", "medios de pago", "forma de pago"],
    answer:
      "Los medios de pago son efectivo y transferencia bancaria (esta última con 10% de descuento).",
  },
  {
    keywords: [
      "horario",
      "hora",
      "abren",
      "abierto",
      "abierta",
      "cierran",
      "cerrado",
      "atencion",
      "domingo",
      "feriado",
    ],
    answer:
      "Atendemos de lunes a sábado de 07:00 a 22:00, y domingos y feriados de 08:00 a 20:00.",
  },
  {
    keywords: ["oferta", "promo", "combo", "rebaja"],
    answer:
      "En la sección Ofertas del menú encontrás productos con descuento y combos armados.",
  },
  {
    keywords: [
      "como comprar",
      "como compro",
      "como hago un pedido",
      "hacer un pedido",
      "carrito",
    ],
    answer:
      "Para comprar, tocá \"Agregar al carrito\" en los productos que quieras, entrá al carrito (ícono de arriba a la derecha), elegí el medio de pago y confirmá.",
  },
];

// Se evalúan después de buscar productos.
const GENERAL_INTENTS: Intent[] = [
  {
    keywords: ["hola", "buenas", "buen dia", "buenos dias"],
    answer: "¡Hola! Soy el asistente de Kiosco El Rápido. ¿En qué te puedo ayudar?",
  },
  {
    keywords: ["stock", "disponible"],
    answer:
      "El stock de cada producto se muestra en su tarjeta. Si te interesa uno en particular, escribime su nombre y te digo cuántas unidades hay.",
  },
  {
    keywords: [
      "categoria",
      "producto",
      "almacen",
      "bebida",
      "snack",
      "golosina",
      "varios",
      "que venden",
      "que tienen",
      "que hay",
    ],
    answer:
      "Tenemos las categorías Almacén, Bebidas, Snacks, Golosinas y Varios. Las encontrás en el menú de arriba, y también podés usar el buscador.",
  },
  {
    keywords: ["gracias", "genial", "perfecto", "chau", "adios"],
    answer: "¡De nada! Cualquier otra duda, acá estoy. 😊",
  },
];

const FALLBACK =
  "No estoy seguro de entender eso. Puedo ayudarte con horarios, medios de pago, ofertas o productos (por ejemplo: \"¿tienen alfajores?\").";

const NOT_FOUND =
  "No encontré ese producto. Probá con otro nombre, o mirá las categorías en el menú de arriba.";

const QUICK_REPLIES = ["Horarios", "Medios de pago", "Ofertas", "Categorías", "Cómo comprar"];

const WELCOME: Message = {
  id: 0,
  from: "bot",
  text: "¡Hola! Soy el asistente de Kiosco El Rápido. Preguntame por horarios, medios de pago, ofertas o por un producto, por ejemplo \"alfajor\".",
};

// Palabras que no sirven para buscar productos.
const STOPWORDS = new Set([
  "quiero", "quisiera", "necesito", "busco", "buscando", "tenes", "tienen", "tienes", "tiene",
  "hay", "venden", "vende", "vendes", "una", "uno", "unos", "unas", "los", "las", "del", "para",
  "por", "favor", "que", "con", "sin", "cuanto", "cuesta", "cuestan", "sale", "salen", "precio",
  "precios", "valor", "stock", "disponible", "comprar", "compro", "dame", "darme", "algo",
  "hola", "buenas", "buenos", "dias", "tardes", "noches", "gracias", "ahora", "hoy", "tienda",
  "kiosco", "producto", "productos", "esta", "estan", "son", "como", "puedo", "podes", "pueden",
]);

const PRODUCT_QUERY_STARTERS = [
  "quiero", "busco", "necesito", "tienen", "tenes", "tienes", "hay", "venden", "vende",
  "cuanto", "precio", "comprar",
];

function clean(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(q: string, words: string[], keyword: string): boolean {
  if (keyword.includes(" ")) return ` ${q} `.includes(` ${keyword} `);
  return words.some((w) => w.startsWith(keyword));
}

function findIntent(q: string, list: Intent[]): Intent | undefined {
  const words = q.split(" ");
  return list.find((intent) => intent.keywords.some((k) => hasKeyword(q, words, k)));
}

// Pasa plurales simples a singular: "alfajores" -> "alfajor", "papas" -> "papa"
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function searchProducts(q: string, products: Product[]): Product[] {
  const tokens = q
    .split(" ")
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .map(stem);
  if (tokens.length === 0) return [];

  return products
    .map((product) => {
      const name = clean(product.name);
      const description = clean(product.description ?? "");
      let score = 0;
      for (const token of tokens) {
        if (name.includes(token)) score += 2;
        else if (description.includes(token)) score += 1;
      }
      return { product, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.product);
}

function looksLikeProductQuery(q: string): boolean {
  const words = q.split(" ");
  return PRODUCT_QUERY_STARTERS.some((s) => words.some((w) => w.startsWith(s)));
}

function getReply(question: string, products: Product[]): Reply {
  const q = clean(question);

  const specific = findIntent(q, SPECIFIC_INTENTS);
  if (specific) return { text: specific.answer };

  const found = searchProducts(q, products);
  if (found.length > 0) {
    const shown = found.slice(0, 5);
    return {
      text: shown.length === 1 ? "¡Sí! Tenemos este producto:" : "Encontré estos productos:",
      items: shown,
    };
  }

  const general = findIntent(q, GENERAL_INTENTS);
  if (general) return { text: general.answer };

  if (looksLikeProductQuery(q)) return { text: NOT_FOUND };
  return { text: FALLBACK };
}

function formatPrice(price: number): string {
  return Number(price).toLocaleString("es-AR");
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carga los productos cada vez que se abre el chat, para tener precio y stock al día
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        // Si falla, el bot sigue respondiendo las preguntas generales
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Scroll automático al último mensaje
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  // Foco en el campo al abrir, y cierre con Escape
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (text: string) => {
    const question = text.trim();
    if (!question) return;

    const userMsg: Message = { id: nextId.current++, from: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const reply = getReply(question, products);
    window.setTimeout(() => {
      const botMsg: Message = {
        id: nextId.current++,
        from: "bot",
        text: reply.text,
        items: reply.items,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 350);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {open && (
        <section className="chatbot-window" role="dialog" aria-label="Chat de ayuda">
          <header className="chatbot-header">
            <span className="chatbot-title">🛒 Asistente El Rápido</span>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </header>

          <div className="chatbot-messages" ref={listRef} aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`chatbot-msg chatbot-msg-${m.from}`}>
                {m.text}
                {m.items && (
                  <ul className="chatbot-items">
                    {m.items.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/products/${p.id}`}
                          className="chatbot-link"
                          onClick={() => setOpen(false)}
                        >
                          {p.name}
                        </Link>
                        <span className="chatbot-item-info">
                          ${formatPrice(p.price)} · {p.stock > 0 ? `${p.stock} en stock` : "sin stock"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="chatbot-quick">
            {QUICK_REPLIES.map((q) => (
              <button key={q} type="button" className="chatbot-chip" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu consulta..."
              aria-label="Escribí tu consulta"
              maxLength={200}
            />
            <button type="submit" className="chatbot-send" aria-label="Enviar mensaje">
              ➤
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar chat" : "Abrir chat de ayuda"}
        aria-expanded={open}
      >
        {open ? (
          "✕"
        ) : (
          <>
            <span className="chatbot-toggle-icon">💬</span>
            <span className="chatbot-toggle-label">¿Te ayudo?</span>
          </>
        )}
      </button>
    </>
  );
}

export default ChatBot;
