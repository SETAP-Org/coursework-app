function konvaDash() {
    // ejs values
    const { username, projectId, notes } = window.scriptData;

    // getting dom elements
    const container = document.querySelector('#Konva-container');
    const addNoteBtn = document.querySelector('#add-note-btn');

    // creating the konva canvas
    const stage = new window.Konva.Stage({
        container: 'Konva-container',
        width: container.clientWidth,
        height: container.clientHeight,
    });
    const layer = new Konva.Layer();
    const transformer = new Konva.Transformer();
    stage.add(layer.add(transformer));

    // other variables
    const MAX_NOTES = 10;
    let noteCount = 0;

    // function to edit the text of a note
    function editText(textNode, group, note) {
        transformer.hide();

        const box = stage.container().getBoundingClientRect();

        // creates a text dom element
        const textarea = document.createElement('textarea');
        textarea.className = "note-editor";

        // positions the text element over the relevant note
        Object.assign(textarea.style, {
            left: `${box.left + group.x() + textNode.x()}px`,
            top: `${box.top + group.y() + textNode.y()}px`,
            width: `${textNode.width()}px`,
            height: `${textNode.height() + 20}px`,
            fontSize: `${textNode.fontSize()}px`
        });

        // configuring the text area
        textarea.value = textNode.text();
        document.body.appendChild(textarea);
        textarea.focus();

        async function finish(save) {
            if (save) {
                textNode.text(textarea.value);
                await fetch(`/api/notes/${note.widget_id}`, {
                    method: "PUT",
                    headers: { 'content-type': "application/json" },
                    body: JSON.stringify({
                        text: textNode.text(),
                        x: note.widget_x,
                        y: note.widget_y,
                    })
                });
            }
            textarea.remove();
            transformer.show();
            layer.draw();
        };

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) finish(true);
            if (e.key === 'Escape') finish(false);
        });

        setTimeout(() => window.addEventListener('click', () => finish(true), { once: true }));
    };

    // function to add note to ui
    async function addNoteToUi(note) {
        // create the group that holds the rectangle and the text
        const group = new Konva.Group({
            x: parseInt(note.widget_x, 10),
            y: parseInt(note.widget_y, 10),
            draggable: true,
        });

        // setting custom attributes on the group
        group.setAttrs({widgetId: note.widget_id});

        // create the konva elements (rectangle and inner text)
        const rect = new Konva.Rect({
            width: 180, height: 100, fill: '#ffffff',
            stroke: '#333333', cornerRadius: 20, shadowBlur: 4,
        });
        const text = new Konva.Text({
            x: 10, y: 10, width: 160, text: note.widget_text,
            fontSize: 18, fill: '#000000',
        });
        group.add(rect, text)
        
        // event listeners to resize the and rotate the note
        group.on('click', () => transformer.nodes([group]));

        // event listener for when note is dragged
        group.on('dragend', async () => {
            // get the new coordinates
            const { x: newX, y: newY } = group.position();

            // if note dragged into specific region, delete the note
            if (newX > stage.width() - 200 && newY > stage.height() - 200) {
                await fetch(`/api/notes/${note.widget_id}`, {method: "DELETE",});

                group.destroy();
                layer.draw();
                noteCount--;
            }
            // otherwise, update the note in the database
            else {
                // update the position of the widget
                console.log('we are here.......', note, newX, newY);
                await fetch(`/api/notes/${note.widget_id}`, {
                    method: "PUT",
                    headers: { 'content-type': "application/json" },
                    body: JSON.stringify({
                        text: note.widget_text,
                        x: parseInt(newX, 10),
                        y: parseInt(newY, 10),
                    })
                });
            }
        });

        // event listener to change text of note
        group.on('dblclick dbltap', () => editText(text, group, note));

        layer.add(group).draw();
        noteCount++;
    }

    // load existing notes onto the konva board
    for (const note of notes) addNoteToUi(note);

    // event listener to handle window resize
    window.addEventListener('resize', () => {
        stage.size({width: container.clientWidth, height: container.clientHeight});
        stage.draw();
    });

    // event listener to add new note button
    addNoteBtn.addEventListener('click', async () => {
        if (noteCount >= MAX_NOTES) {
            alert('Maximum of 10 notes reached.');
        } else {
            // add new note to database
            const response = await fetch(`/api/notes`, {
                method: "POST",
                headers: { 'content-type': "application/json" },
                body: JSON.stringify({
                    projectId: projectId,
                    text: 'Double-click to edit',
                    x: 50 + noteCount * 10,
                    y: 50 + noteCount * 10,
                })
            });
            const data = await response.json();

            // add new note to the ui
            if (!data.success) {
                alert('Note failed to be added');
            } else {
                addNoteToUi(data.note);
                noteCount++;
            }
        }
    });
}

konvaDash();