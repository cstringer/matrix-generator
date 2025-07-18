const NUM_COLS = 60;
const NUM_ROWS = 50;

const matrix = document.getElementById('the_matrix');

function generateRandomChar(max = 0) {
  let text = '';
  for (let i = max; i >= 0; i--) {
    const opacity = (max - i) / max;
    const colorCls = i === 0 ? 'last' : '';
    text += `<span class="char ${colorCls}" style="opacity:${opacity}">`;
    text += String.fromCharCode(Math.floor(randomCount(92) + 65));
    text += '</span>';
    text += '<br />';
  }
  return text;
}

function randomCount(scale) {
  return Math.floor(Math.random() * scale);
}

function makeColumn(colNum) {
  const column = document.createElement('div');
  column.className = 'column';
  matrix.append(column);

  let count = randomCount(NUM_ROWS);
  let randomInterval = () => randomCount(133) + 17;
  const startAnimation = () => setInterval(animateColumn, randomInterval());
  let id = null;
  const animateColumn = () => {
    if (id % 4 !== 0) {
      column.innerHTML = generateRandomChar(count);
    } else {
      column.innerHTML = '&nbsp;';
    }
    count++;
    if (count >= NUM_ROWS) {
      count = randomCount(NUM_ROWS);
      clearInterval(id);
      id = startAnimation();
    }
  };
  id = startAnimation();
}

for (let c = 0; c < NUM_COLS; c++) {
  makeColumn(c);
}
