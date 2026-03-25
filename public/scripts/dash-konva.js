const container = document.getElementById('Konva-container');
const addNoteBtn = document.getElementById('add-note-btn');

if (container && addNoteBtn) {
  const stage = new Konva.Stage({
    container: 'Konva-container',
    width: container.clientWidth,
    height: 500,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const transformer = new Konva.Transformer();
  layer.add(transformer);

  const MAX_NOTES = 20;
  let noteCount = 0;

  function makeSelectable(node) {
    node.on('click tap', () => {
      transformer.nodes([node]);
      layer.draw();
    });
  }

  function createNote() {
    if (noteCount >= MAX_NOTES) {
      alert('Maximum of 20 notes reached.');
      return;
    }

    const group = new Konva.Group({
      x: 50 + noteCount * 10,
      y: 50 + noteCount * 10,
      draggable: true,
    });

    const rect = new Konva.Rect({
      width: 180,
      height: 100,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1,
      cornerRadius: 8,
      shadowBlur: 4,
      shadowColor: 'rgba(0,0,0,0.2)',
    });

    const text = new Konva.Text({
      x: 10,
      y: 10,
      width: 160,
      text: 'Double-click to edit',
      fontSize: 18,
      fill: '#000000',
    });

    group.add(rect);
    group.add(text);
    makeSelectable(group);

    group.on('dblclick dbltap', () => {
      editText(text, group);
    });

    layer.add(group);
    layer.draw();

    noteCount++;
  }

  function editText(textNode, group) {
    transformer.hide();
    layer.draw();

    const textPosition = {
      x: group.x() + textNode.x(),
      y: group.y() + textNode.y(),
    };

    const stageBox = stage.container().getBoundingClientRect();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.left = stageBox.left + textPosition.x + 'px';
    textarea.style.top = stageBox.top + textPosition.y + 'px';
    textarea.style.width = textNode.width() + 'px';
    textarea.style.height = textNode.height() + 20 + 'px';
    textarea.style.fontSize = textNode.fontSize() + 'px';
    textarea.style.fontFamily = 'Arial';
    textarea.style.border = '1px solid #ccc';
    textarea.style.padding = '4px';
    textarea.style.margin = '0';
    textarea.style.resize = 'none';
    textarea.style.outline = 'none';
    textarea.style.background = '#ffffff';
    textarea.style.color = '#000000';

    textarea.focus();

    function removeTextarea(save = true) {
      if (save) {
        textNode.text(textarea.value);
      }
      textarea.remove();
      transformer.show();
      layer.draw();
      window.removeEventListener('click', handleOutsideClick);
    }

    function handleOutsideClick(e) {
      if (e.target !== textarea) {
        removeTextarea(true);
      }
    }

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        removeTextarea(true);
      }
      if (e.key === 'Escape') {
        removeTextarea(false);
      }
    });

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  }

  addNoteBtn.addEventListener('click', createNote);

  window.addEventListener('resize', () => {
    stage.width(container.clientWidth);
    stage.height(500);
    stage.draw();
  });
}