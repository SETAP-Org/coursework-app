const container = document.getElementById('Konva-container');
const addNoteBtn = document.getElementById('add-note-btn');
const removeNote = document.getElementById('remove-note');
const noteTrigger = document.getElementById('note-trigger');

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

  const MAX_NOTES = 10;
  let noteCount = 0;
  let lastSelectedNote = null 

  function makeSelectable(node) {
    node.on('click tap', () => {
      transformer.nodes([node]);
      lastSelectedNote = node;
      layer.draw();
    });
  }

  function createNote() {
    if (noteCount >= MAX_NOTES) {
      alert('Maximum of 10 notes reached.');
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
      cornerRadius: 20,
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

    const noteDisplay = document.createElement('div');
    noteDisplay.className = 'note-display';
    noteDisplay.style.display='none';
    noteDisplay.style.position='absolute';
    noteDisplay.style.top='32%';
    noteDisplay.style.left='42%';
    noteDisplay.style.padding='5px';
    noteDisplay.style.border='2px solid black';
    noteDisplay.style.backgroundColor='white';
    noteDisplay.style.borderRadius='20px';
    noteDisplay.style.height="15%";
    noteDisplay.style.width="15%";
    noteDisplay.textContent = "i'll make it so you can change font size and color later";
    noteDisplay.style.color = 'black';

    document.body.appendChild(noteDisplay);
    group.noteDisplay=noteDisplay;

    group.on('dblclick dbltap', () => {
      editText(text, group);
    });

  layer.add(group);
  layer.draw();

  noteCount++;
}

  removeNote.addEventListener('click', () => {
    const selectedNodes = transformer.nodes();

    if (selectedNodes.length === 0){
      return;
    }

    const node = selectedNodes[0];

    if (node.noteDisplay){
      node.noteDisplay.remove();
    }

    if (lastSelectedNote === node){
      lastSelectedNote = null;
    }

    selectedNodes[0].destroy();
    transformer.nodes([]);
    layer.draw();
    noteCount--;
  });

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

  function showNote(noteDisplay) {
    if (noteDisplay.style.display === 'none' || noteDisplay.style.display === ''){
      noteDisplay.style.display= 'flex';
    } else {
      noteDisplay.style.display = 'none';
    }
  }

  addNoteBtn.addEventListener('click', createNote);

  noteTrigger.addEventListener('click', () =>{
    if(!lastSelectedNote || !lastSelectedNote.noteDisplay){
      return;
    }
    showNote(lastSelectedNote.noteDisplay);
  })

  window.addEventListener('resize', () => {
    stage.width(container.clientWidth);
    stage.height(500);
    stage.draw();
  });
}