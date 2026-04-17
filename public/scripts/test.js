import { saveNotesToDB, deleteNoteFromDB, getNotesFromDB } from "/scripts/konva-func.js";

console.log("If this logs, modules are working!");

const pathSegments = window.location.pathname.split('/');
const projectIndex = pathSegments.indexOf('projects');
const projectId = pathSegments[projectIndex + 1];

const container = document.getElementById('Konva-container');
const addNoteBtn = document.getElementById('add-note-btn');

if (container && addNoteBtn) {
  const stage = new window.Konva.Stage({
    container: 'Konva-container',
    width: container.clientWidth,
    height: container.clientHeight,
  });

  const layer = new Konva.Layer();
  const transformer = new Konva.Transformer();
  stage.add(layer.add(transformer));

  const MAX_NOTES = 10;
  let noteCount = 0;

  async function init () {
    const savedNotes = await getNotesFromDB(projectId);
    if (savedNotes && Array.isArray(savedNotes)){
      savedNotes.forEach(note => {
        createNote(note.widget_text, note.widget_x, note.widget_y); 
      });
    }
  }
  init(); //create existing notes whent he page loads up 

  function createNote() {
    if (noteCount >= MAX_NOTES) return alert('Maximum of 10 notes reached.');

    const group = new Konva.Group({
      x: 50 + noteCount * 10, y: 50 + noteCount * 10, draggable: true,
    });

    group.setAttrs({dbX: group.x(), dbY: group.y()});

    const rect = new Konva.Rect({
      width: 180, height: 100, fill: '#ffffff',
      stroke: '#333333', cornerRadius: 20, shadowBlur: 4,
    });

    const text = new Konva.Text({
      x: 10, y: 10, width: 160, text: 'Double-click to edit',
      fontSize: 18, fill: '#000000',
    });

    group.add(rect, text).on('click', () => transformer.nodes([group]));

    group.on('dragend', async () => {
      const { x: newX, y: newY } = group.position();


      if (newX > stage.width() - 200 && newY > stage.height() - 200) {
        await deleteNoteFromDB(projectId, text.text(), group.attrs.dbX, group.attrs.dbY);
        group.destroy(); layer.draw(); noteCount--; 
      }else {
        await saveNotesToDB(projectId, text.text(), newX, newY);
        group.setAttrs({dbX: newX, dbY: newY});
      }
    });

    group.on('dblclick dbltap', () =>  editText(text, group));
    layer.add(group).draw();
    noteCount++;
}

  function editText(textNode, group) {
    transformer.hide();
  
    const box = stage.container().getBoundingClientRect();
    const textarea = document.createElement('textarea');
   
    textarea.className = "note-editor";
    Object.assign(textarea.style, {
      left: `${box.left + group.x() + textNode.x()}px`,
      top: `${box.top + group.y() + textNode.y()}px`,
      width: `${textNode.width()}px`,
      height: `${textNode.height() + 20}px`,
      fontSize: `${textNode.fontSize()}px`
    });

    textarea.value = textNode.text();
    document.body.appendChild(textarea);
    textarea.focus();

    const finish = async (save) => {
      if (save) {
        textNode.text(textarea.value);
        await saveNotesToDB(projectId, textNode.text(), group.attrs.dbX, group.attrs.dbY);
        group.setAttrs({dbX: group.x(), dbY: group.y()});
      }
      textarea.remove();
      transformer.show();
      layer.draw();
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) finish(true);
      if (e.key === 'Escape') finish(false);
    });

    setTimeout(() => 
      window.addEventListener('click', () => finish(true), { once: true }));
    };

  addNoteBtn.addEventListener('click', () => createNote());
  
  window.addEventListener('resize', () => {
    stage.size({width: container.clientWidth, height: container.clientHeight});
    stage.draw();
  });
}