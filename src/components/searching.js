/**
 * Инициализация поиска
 * @param {string} searchField - имя поля в state, содержащего поисковый запрос
 * @returns {Function} функция, добавляющая параметр search к объекту query
 */

export function initSearching(searchField) {
  return (query, state, action) => {
    return state[searchField]
      ? Object.assign({}, query, {
          // проверяем, что в поле поиска было что-то введено
          search: state[searchField], // устанавливаем в query параметр
        })
      : query; // если поле с поиском пустое, просто возвращаем query без изменений
  };
}
