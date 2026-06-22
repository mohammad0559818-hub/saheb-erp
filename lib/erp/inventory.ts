export function weightedAverageCost(currentQty: number, currentValue: number, incomingQty: number, incomingCost: number) {
  const totalQty = currentQty + incomingQty;
  if (totalQty <= 0) return 0;
  return (currentValue + incomingQty * incomingCost) / totalQty;
}

export function stockMovementValue(direction: "in" | "out" | "transfer", quantity: number, unitCost: number) {
  const sign = direction === "out" ? -1 : 1;
  return sign * quantity * unitCost;
}
