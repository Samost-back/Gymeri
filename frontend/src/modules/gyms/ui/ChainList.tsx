import { getChains } from "../api/gyms";
import { ChainCard } from "./ChainCard/ChainCard";
import styles from "./lists.module.css";

export async function ChainList() {
  const chains = await getChains();

  if (chains.length === 0) {
    return <p className={styles.empty}>Каталог поки порожній.</p>;
  }
  return (
    <div className={styles.list}>
      {chains.map((chain, index) => (
        <ChainCard key={chain.slug} chain={chain} position={index + 1} />
      ))}
    </div>
  );
}
