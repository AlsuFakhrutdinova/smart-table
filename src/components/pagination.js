import { getPages } from "../lib/utils.js";

/**
 * Инициализация пагинации
 * @param {Object} elements - DOM-элементы пагинации
 * @param {HTMLElement} elements.pages - контейнер для кнопок страниц
 * @param {HTMLElement} elements.fromRow - элемент для отображения номера первой отображаемой строки
 * @param {HTMLElement} elements.toRow - элемент для отображения номера последней отображаемой строки
 * @param {HTMLElement} elements.totalRows - элемент для отображения общего количества строк
 * @param {Function} createPage - колбэк для создания кнопки страницы
 * @returns {{ applyPagination: Function, updatePagination: Function }}
 */
export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage,
) => {
  // подготавливаем шаблон кнопки страницы и очищаем контейнер
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  let pageCount;

  /**
   * Формирует параметры пагинации для запроса
   * @param {Object} query - текущие параметры запроса
   * @param {Object} state - состояние формы
   * @param {HTMLButtonElement} [action] - элемент, вызвавший действие (кнопка пагинации)
   * @returns {Object} новый объект query с добавленными limit и page
   */
  const applyPagination = (query, state, action) => {
    const limit = state.rowsPerPage;
    let page = state.page;

    // @todo: #2.6 — обработать действия
    if (action) {
      switch (action.name) {
        case "prev":
          page = Math.max(1, page - 1);
          break; //переход на предыдущую страницу
        case "next":
          page = Math.min(pageCount, page + 1);
          break;
        case "first":
          page = 1;
          break;
        case "last":
          page = pageCount;
          break;
      }
    }

    return Object.assign({}, query, {
      limit,
      page,
    });
  };

  /**
   * Обновляет UI пагинации на основе полученных данных
   * @param {number} total - общее количество записей
   * @param {Object} params - параметры текущей страницы
   * @param {number} params.page - номер текущей страницы
   * @param {number} params.limit - количество записей на странице
   */
  const updatePagination = (total, { page, limit }) => {
    pageCount = Math.ceil(total / limit);

    const visiblePages = getPages(page, pageCount, 5); // Получим массив страниц, которые нужно показать, выводим только 5 страниц
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        // перебираем их и создаем для них кнопку
        const el = pageTemplate.cloneNode(true); // клонируем шаблон, который заполнили ранее
        return createPage(el, pageNumber, pageNumber === page); // вызываем колбэк из настроек, чтобы заполнить кнопку данными
      }),
    );

    fromRow.textContent = (page - 1) * limit + 1; // с какой строки выводим
    toRow.textContent = Math.min(page * limit, total); // до какой строки выводим, если это последняя страница, то отображаем оставшееся количество
    totalRows.textContent = total;
  };

  return {
    updatePagination,
    applyPagination,
  };
};
