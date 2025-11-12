
export interface Transaction {
  id: string
  date: string // e.g. '2025-10-22 14:30'
  symbol: string
  action: 'Buy' | 'Sell'
  quantity: number
  price: number
  total: number
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className=" w-full mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
      
      <div className="divide-y divide-gray-200">
        {transactions.length === 0 && (
          <p className="text-gray-500 text-center py-8">No transactions found.</p>
        )}

        {transactions.map(tx => (
          <div key={tx.id} className="flex justify-between items-center py-3">
            <div className="flex flex-col">
              <span className="text-gray-700 font-medium">{tx.symbol}</span>
              <span className="text-gray-400 text-sm">{tx.date}</span>
            </div>

            <div className="flex flex-col items-end">
              <span className={`font-semibold ${tx.action === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.action} {tx.quantity} @ ${tx.price.toFixed(2)}
              </span>
              <span className="text-gray-600 text-sm">${tx.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
