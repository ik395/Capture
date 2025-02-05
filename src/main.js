const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;
const { once } = window.__TAURI__.event;
const { getCurrentWebviewWindow } = window.__TAURI__.webviewWindow;

const webpage = getCurrentWebviewWindow();
invoke('buttons')

webpage.once("buttons", (event) => {
  const names = event.payload;

  const button = document.getElementById('capture')
  button.id = names
  createGraph(button)

  button.addEventListener('click', function() {
    webpage.emit('returnTrigger', button.id )
  })
})

function createGraph(button) {
  let capture;
  let listenerName = button.id.split('.').slice(0, 1).toString();
  webpage.listen(listenerName, (event) => {
    const result = event.payload

    new Promise((resolve) => {
      const plotCreated = setInterval(() => {
          if (capture !== undefined) {
              clearInterval(plotCreated);
              resolve();
          }
      }, 100);
    }).then(() => {
        let count = 0
        capture.setData([[],[]], true)

        for (let progress in result){
          capture.data[0].push(count);
          capture.data[1].push(result[progress])
          count += 1
        }
        capture.setData(capture.data, true);
    })
  })

  setTimeout(() => {
    const canvas = document.createElement('div');
    canvas.id = `capture_${button.id}`;
    document.getElementById("Plot").appendChild(canvas)

    let opt = {
        width: 600,
        height: 300,
        series: [
          {},
          {
            label: button.id,
            stroke: 'red',
            points: {show: false},
            value: (u,v) => v
          }
        ],
        scales: {
            x: { 
              time: false, 
              auto:true
              
            },
            y: { distr: 2 }
        },
        axes: [
            {},
            { size: 100, values: (u, v) => v }
        ]
    };
    let data = [[],[]]
    let chart = new uPlot(opt, data, document.getElementById(canvas.id));
    capture = chart
  }, 100);
}