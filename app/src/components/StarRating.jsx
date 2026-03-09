import { C } from "../utils/constants";
import { Icons } from "./Icons";
export function StarRating({ value, onChange, size = 20 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange && onChange(n)}
          style={{ background: "none", border: "none", cursor: onChange ? "pointer" : "default", padding: 1 }}>
          <Icons.Star size={size} color={C.yellow} filled={n <= value} />
        </button>
      ))}
    </div>
  );
}
