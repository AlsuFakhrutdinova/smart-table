import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
// @todo: подключение
import { initSorting } from "./components/sorting.js";
import { initSearching } from "./components/searching.js";
import { initFiltering } from "./components/filtering.js";
import { initPagination } from "./components/pagination.js";

// Исходные данные используемые в render()
const { data, ...indexes } = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container)); //state — это состояние полей формы
  const rowsPerPage = parseInt(state.rowsPerPage); // приведём количество страниц к числу
  const page = parseInt(state.page ?? 1); // номер страницы по умолчанию 1 и тоже число
  const total = [parseFloat(state.totalFrom), parseFloat(state.totalTo)]; //В compare.js в функции arrayAsRange() идет деструктуризация массива и использование: const [from, to] = targetValue;

  return {
    ...state,
    rowsPerPage,
    page,
    total,
  };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let result = [...data]; // копируем для последующего изменения

  // @todo: использование: ЕДИНЫЙ PIPELINE: данные проходят через ВСЕ модули по очереди
  result = applySearching(result, state, action);
  result = aplyFiltering(result, state, action);
  result = applySorting(result, state, action);
  result = applyPagination(result, state, action);

  sampleTable.render(result);
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

// @todo: инициализация
const applySorting = initSorting([
  // Нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const aplyFiltering = initFiltering(sampleTable.filter.elements, {
  // передаем элементы фильтра
  searchBySeller: indexes.sellers, // для элемента с именем searchBySeller устанавливаем массив продавцов
});

const applyPagination = initPagination(
  sampleTable.pagination.elements, // передаем сюда элементы пагинации, найденные в шаблоне
  (el, page, isCurrent) => {
    // и колбэк, чтобы заполнить кнопки страниц данными
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

render();
