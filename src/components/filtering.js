/**
 * Инициализация фильтрации
 * @param {Object} elements - DOM-элементы фильтров (собранные по data-name)
 * @returns {{ updateIndexes: Function, applyFiltering: Function }}
 */

export function initFiltering(elements) {
  /**
   * Заполняет выпадающие списки опциями
   * @param {Object} elements - элементы фильтров
   * @param {Object} indexes - объект с массивами значений для каждого селекта
   */
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes) // Получаем ключи объекта
      .forEach((elementName) => {
        // Перебираем по именам
        elements[elementName].append(
          ...Object.values(indexes[elementName]).map((name) => {
            // name как значение и текстовое содержимое
            const el = document.createElement("option");
            el.textContent = name;
            el.value = name;
            return el;
          }),
        );
      });
  };

  /**
   * Формирует параметры фильтрации для запроса
   * @param {Object} query - текущие параметры запроса
   * @param {Object} state - состояние формы
   * @param {HTMLButtonElement} [action] - кнопка, вызвавшая действие (например, clear)
   * @returns {Object} новый объект query с добавленными параметрами фильтрации
   */
  const applyFiltering = (query, state, action) => {
    // проверяем наличие действия, и что это действие - кнопка с именем clear
    if (action && action.name === "clear") {
      // находим родительский label и в нём input
      const input = action.parentElement.querySelector("input");

      if (input) {
        input.value = ""; // очищаем input

        const field = action.dataset.field;
        const stateField = `searchBy${field.charAt(0).toUpperCase() + field.slice(1)}`;
        state[stateField] = "";
      }
      // Возвращаем данные без изменений (фильтрация не применяется)
      return query;
    }

    const filter = {};
    Object.keys(elements).forEach((key) => {
      if (elements[key]) {
        if (
          ["INPUT", "SELECT"].includes(elements[key].tagName) &&
          elements[key].value
        ) {
          // ищем поля ввода в фильтре с непустыми данными
          filter[`filter[${elements[key].name}]`] = elements[key].value; // чтобы сформировать в query вложенный объект фильтра
        }
      }
    });
    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
