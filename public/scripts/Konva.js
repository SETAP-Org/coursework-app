import Konva from 'konva';

export function initKonva(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight || 400;

  const stage = new Konva.Stage({
    container: containerId,
    width,
    height,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const rect = new Konva.Rect({
    x: 50,
    y: 50,
    width: 100,
    height: 80,
    fill: 'cornflowerblue',
    shadowBlur: 5,
    cornerRadius: 4,
    draggable: true,
  });

  rect.on('click tap', () => {
    rect.fill(Konva.Util.getRandomColor());
    layer.draw();
  });

  layer.add(rect);
  layer.draw();

  return stage;
}