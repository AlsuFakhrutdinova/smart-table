import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";

import { initSorting } from "./components/sorting.js";
import { initSearching } from "./components/searching.js";
import { initFiltering } from "./components/filtering.js";
import { initPagination } from "./components/pagination.js";

const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object} состояние формы с дополнительными вычисляемыми полями
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));
  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);
  const total = [parseFloat(state.totalFrom), parseFloat(state.totalTo)];

  return {
    ...state,
    rowsPerPage,
    page,
    total,
  };
}

/**
 * Основная функция рендера таблицы. Вызывается при любом изменении состояния.
 * Последовательно формирует query, запрашивает данные с сервера и обновляет UI.
 * @param {HTMLButtonElement} [action] - кнопка, вызвавшая действие (пагинация, сортировка, clear)
 */
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let query = {};
  query = applySearching(query, state, action);
  query = applyFiltering(query, state, action);
  query = applySorting(query, state, action);
  query = applyPagination(query, state, action);

  const { total, items } = await api.getRecords(query); // запрашиваем данные с собранными параметрами
  updatePagination(total, query); // перерисовываем пагинатор

  sampleTable.render(items);
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render,
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements,
);

const { applyPagination, updatePagination } = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  },
);

const applySearching = initSearching("search");

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

/**
 * Асинхронная инициализация:
 * - получает справочники с сервера
 * - заполняет выпадающие списки
 * - запускает первый рендер
 */
async function init() {
  const indexes = await api.getIndexes();
  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
  });
}

init().then(render);
