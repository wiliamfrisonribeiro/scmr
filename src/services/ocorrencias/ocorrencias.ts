// src/api/services/ocorrenciasService.ts
import { createPaginate } from 'js-query-pagination';



export async function fetchOcorrencias(page = 1, pageSize = 5, accountId = '3441d761-b01a-4d6d-854f-62511bfbe453', status = 'todos') {
  const paginate = createPaginate()
    .page(page)
    .limit(pageSize)
    .equalsAnd('account_id', accountId)
    .sort('-created_date');

  if (status !== 'todos') {
    paginate.equalsAnd('ocurrency_status', status);
  }

  const url = paginate.buildUrl('https://smrc.onrender.com/ocurrencies');

  const response = await fetch(url);
  const data = await response.json();

  return data;
} 



export async function fetchOcorrenciaById(id: string) {

  const url = `https://smrc.onrender.com/ocurrencies/${id}`

  const response = await fetch(url)

  const data = await response.json()

  return data
}


export async function fetchOcorrenciasAll() {

  const paginate = createPaginate()
  .page(1)
  .limit(10000).sort('-created_date')

  const url = paginate.buildUrl('https://smrc.onrender.com/ocurrencies')

  const response = await fetch(url)

  const data = await response.json()

  return data
}


export async function fetchOcorrenciasAllUser(accountId: string) {

  const paginate = createPaginate()
  .page(1)
  .limit(10000)
  .equalsAnd('account_id', accountId)

  const url = paginate.buildUrl('https://smrc.onrender.com/ocurrencies')

  const response = await fetch(url)

  const data = await response.json()

  return data
}



export async function fetchOcorrenciasStatus(status: string) {
  const paginate = createPaginate()
  .page(1)
  .limit(10000).equalsAnd('ocurrency_status', status).sort('-created_date')

  const url = paginate.buildUrl('https://smrc.onrender.com/ocurrencies')

  const response = await fetch(url)

  const data = await response.json()

  return data

}

export async function fetchOcorrenciasForAuthority(page = 1, pageSize = 5, status = 'todos') {
  const paginate = createPaginate()
    .page(page)
    .limit(pageSize)
    .sort('-created_date');

  if (status !== 'todos') {
    paginate.equalsAnd('ocurrency_status', status);
  }

  const url = paginate.buildUrl('https://smrc.onrender.com/ocurrencies');

  const response = await fetch(url);
  const data = await response.json();

  return data;
}