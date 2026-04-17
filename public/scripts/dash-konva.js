
const container = document.getElementById('Konva-container');
const addNoteBtn = document.getElementById('add-note-btn');

if (container && addNoteBtn) {
  const stage = new Konva.Stage({
    container: 'Konva-container',
    width: container.clientWidth,
    height: container.clientHeight,
  });

  const layer = new Konva.Layer();
  const transformer = new Konva.Transformer();
  stage.add(layer.add(transformer));

  const MAX_NOTES = 10;
  let noteCount = 0;

  function createNote() {
    if (noteCount >= MAX_NOTES) return alert('Maximum of 10 notes reached.');

    const group = new Konva.Group({
      x: 50 + noteCount * 10, y: 50 + noteCount * 10, draggable: true,
    });

    const rect = new Konva.Rect({
      width: 180, height: 100, fill: '#ffffff',
      stroke: '#333333', cornerRadius: 20, shadowBlur: 4,
    });

    const text = new Konva.Text({
      x: 10, y: 10, width: 160, text: 'Double-click to edit',
      fontSize: 18, fill: '#000000',
    });

    group.add(rect, text).on('click', () => transformer.nodes([group]));

    group.on('dragend', () => {
      const { x, y } = group.position();
      if (x > stage.width() - 200 && y > stage.height() - 200) {group.destroy(); layer.draw(); noteCount--; }
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

    const finish = (save) => {
      if (save) textNode.text(textarea.value);
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

  addNoteBtn.addEventListener('click', createNote);
  window.addEventListener('resize', () => {
    stage.size({width: container.clientWidth, height: container.clientHeight});
    stage.draw();
  });
}