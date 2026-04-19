// BASE_URL для API
const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

/**
 * Инициализация API для работы с данными
 * @param {Object} sourceData - исходные данные (не используется при работе с сервером)
 * @returns {Object} API с методами getIndexes и getRecords
 */
export function initData(sourceData) {
  //  переменные для кеширования данных
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  /**
   * Преобразует записи сервера в формат, удобный для таблицы
   * @param {Array} data - массив записей с сервера
   * @returns {Array} массив объектов с полями id, date, seller, customer, total
   */
  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  /**
   * Получает справочники продавцов и покупателей (кеширует)
   * @returns {Promise<Object>} объект с массивами sellers и customers
   */
  const getIndexes = async () => {
    if (!sellers || !customers) {
      // если индексы ещё не установлены, то делаем запросы
      [sellers, customers] = await Promise.all([
        // запрашиваем и деструктурируем в уже объявленные ранее переменные
        fetch(`${BASE_URL}/sellers`).then((res) => res.json()), // запрашиваем продавцов
        fetch(`${BASE_URL}/customers`).then((res) => res.json()), // запрашиваем покупателей
      ]);
    }
    return { sellers, customers };
  };

  /**
   * Получает записи о продажах с сервера с учётом кеширования
   * @param {Object} query - параметры запроса (search, filter, sort, limit, page)
   * @param {boolean} [isUpdated=false] - принудительно пропустить кеш (чтобы иметь возможность делать запрос без кеша)
   * @returns {Promise<Object>} объект с total и items
   */
  const getRecords = async (query, isUpdated = false) => {
    const qs = new URLSearchParams(query); // преобразуем объект параметров в SearchParams объект, представляющий query часть url
    const nextQuery = qs.toString(); // и приводим к строковому виду
    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult; // если параметры запроса не поменялись, то отдаём сохранённые ранее данные
    }

    // если прошлый квери не был ранее установлен или поменялись параметры, то запрашиваем данные с сервера
    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
    const records = await response.json();

    lastQuery = nextQuery; // сохраняем для следующих запросов
    lastResult = {
      total: records.total,
      items: mapRecords(records.items),
    };

    return lastResult;
  };

  return {
    getIndexes,
    getRecords,
  };
}
