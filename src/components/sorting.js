import { sortMap } from "../lib/sort.js";

/**
 * Инициализация сортировки
 * @param {HTMLElement[]} columns - массив кнопок сортировки
 * @returns {Function} функция applySorting для для последовательного формирования параметров запроса
 */
export function initSorting(columns) {
  /**
   * Формирует параметр сортировки для запроса
   * @param {Object} query - текущие параметры запроса
   * @param {Object} state - состояние формы
   * @param {HTMLButtonElement} [action] - элемент, вызвавший действие (кнопка сортировки)
   * @returns {Object} новый объект query с добавленным sort
   */
  return (query, state, action) => {
    let field = null;
    let order = null;

    if (action && action.name === "sort") {
      // Обновляем состояние нажатой кнопки
      action.dataset.value = sortMap[action.dataset.value];
      field = action.dataset.field; // Информация о сортируемом поле есть также в кнопке
      order = action.dataset.value; // Направление заберем прямо из датасета для точности

      // сбрасываем сортировки остальных колонок
      columns.forEach((column) => {
        // Перебираем элементы (в columns у нас массив кнопок)
        if (column.dataset.field !== action.dataset.field) {
          // Если это не та кнопка, что нажал пользователь
          column.dataset.value = "none"; // тогда сбрасываем её в начальное состояние
        }
      });
    } else {
      // ищем активную кнопку
      columns.forEach((column) => {
        // Перебираем все кнопки сортировки
        if (column.dataset.value !== "none") {
          // Ищем ту, что находится не в начальном состоянии (предполагаем, что одна)
          field = column.dataset.field; // Сохраняем в переменных поле
          order = column.dataset.value; // и направление сортировки
        }
      });
    }

    const sort = field && order !== "none" ? `${field}:${order}` : null; // сохраним в переменную параметр сортировки в виде field:direction

    return sort ? Object.assign({}, query, { sort }) : query; // по общему принципу, если есть сортировка, добавляем, если нет, то не трогаем query
  };
}
