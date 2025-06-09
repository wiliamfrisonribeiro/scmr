// src/api/services/ocorrenciasService.ts
import { createPaginate } from 'js-query-pagination';



export async function fetchOcorrencias(page = 1, pageSize = 5, accountId = '3441d761-b01a-4d6d-854f-62511bfbe453') {
  const paginate = createPaginate()
  .page(page)
  .limit(pageSize).equalsAnd('account_id', accountId)

  const url = paginate.buildUrl('https://smrc.onrender.com/ocurrencies')

  const response = await fetch(url)

  const data = await response.json()

  debugger
  return data
}