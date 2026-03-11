import { createComparison, defaultRules } from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнить выпадающие списки опциями
  Object.keys(indexes) // Получаем ключи объекта
    .forEach((elementName) => {
      // Перебираем по именам
      elements[elementName].append(
        // в каждый элемент добавляем опции
        ...Object.values(indexes[elementName]) // формируем массив имён, значений опций
          .map((name) => {
            // используйте name как значение и текстовое содержимое
            // @todo: создать и вернуть тег опции
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            return option;
          }),
      );
    });

  return (data, state, action) => {
    // @todo: #4.2 — обработать очистку поля
    /*Когда пользователь нажимает на крестик:
    1. Срабатывает событие submit (так как кнопка type="submit")
    2. В action попадает эта кнопка
    3. Код получает action и обрабатывает очистку
    4. После очистки данные возвращаются без изменений (фильтр снят) */

    // Проверяем наличие действия, и что это действие - кнопка с именем clear
    if (action && action.name === "clear") {
      // находим родительский label и в нём input
      const input = action.parentElement.querySelector("input");

      if (input) {
        input.value = ""; // очищаем input

        // Получаем поле из data-field
        const field = action.dataset.field;
        const stateField = `searchBy${field.charAt(0).toUpperCase() + field.slice(1)}`;
        state[stateField] = "";
      }
      // Возвращаем данные без изменений (фильтрация не применяется)
      return data;
    }

    // @todo: #4.5 — отфильтровать данные, используя компаратор
    return data.filter((row) => compare(row, state));
  };
}
