import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
  const { tableTemplate, rowTemplate, before, after } = settings;
  const root = cloneTemplate(tableTemplate);

  // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
  before.reverse().forEach((subName) => {
    root[subName] = cloneTemplate(subName); // клонируем и получаем объект, сохраняем в таблице
    root.container.prepend(root[subName].container); // добавляем к таблице после (append) или до (prepend)
  });

  after.forEach((subName) => {
    root[subName] = cloneTemplate(subName); // клонируем и получаем объект, сохраняем в таблице
    root.container.append(root[subName].container); // добавляем к таблице после (append) или до (prepend)
  });

  // @todo: #1.3 —  обработать события и вызвать onAction()
  root.container.addEventListener("change", () => {
    onAction();
  });

  root.container.addEventListener("reset", () => {
    setTimeout(onAction);
  });

  root.container.addEventListener("submit", (e) => {
    e.preventDefault(); // предотвращаем стандартное поведение
    onAction(e.submitter);
  });

  const render = (data) => {
    // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);

      Object.keys(item).forEach((key) => {
        // Существует ли key в row.elements
        if (key in row.elements) {
          // в row шаблон, а в item — конкретная строка данных.
          row.elements[key].textContent = item[key];
        }
      });

      return row.container;
    });
    root.elements.rows.replaceChildren(...nextRows); // вставляем строки в контейнер rows
  };

  return { ...root, render };
}
