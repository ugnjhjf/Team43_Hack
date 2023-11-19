window.onload = function () {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const loading = document.getElementById('loading');
  const overlay = document.getElementById('overlay');
  const buttoncap = document.getElementById('capture');
  loading.style.display = 'inline-block';
  overlay.style.display = 'flex';
  var model;

  const setupWebcam = async () => {
    return new Promise((resolve, reject) => {
      // 尝试使用后置摄像头
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: 'environment', width: 640, height: 480 },
        })
        .then((stream) => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            resolve();
          };
        })
        .catch((err) => {
          console.log('后置摄像头不可用，尝试使用前置摄像头: ' + err.message);
          // 如果后置摄像头不可用，尝试使用前置摄像头
          navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'user' } })
            .then((stream) => {
              video.srcObject = stream;
              video.onloadedmetadata = () => {
                resolve();
              };
            })
            .catch((err) => {
              // 如果前后摄像头都不可用，返回错误
              console.log('前置摄像头也不可用: ' + err.message);
              reject(err);
            });
        });
    });
  };

  const buttonactions = async () => {
    if (video.style.display == 'none') {
      video.style.display = 'inline-block';
    } else {
      video.style.display = 'none';
      loadingstart();
    }
    if (canvas.style.display == 'none') {
      canvas.style.display = 'inline-block';
    } else {
      canvas.style.display = 'none';
    }
    buttonchange();
  };

  const detectObjects = async () => {
    if (buttoncap.innerText == 'Capture') {
      const predictions = await model.detect(video);

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      let detectedItems = [];

      predictions.forEach((prediction) => {
        context.beginPath();
        context.rect(...prediction.bbox);
        context.lineWidth = 2;
        context.strokeStyle = 'blue';
        context.fillStyle = 'blue';
        context.stroke();
        context.fillText(
          `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
          prediction.bbox[0],
          prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
        );
        detectedItems.push(prediction.class);
      });
      sessionStorage.setItem('detectedItems', JSON.stringify(detectedItems));
      detectresult();
    }
    buttonactions();
  };

  function buttonchange() {
    if (buttoncap.innerText == 'Capture') {
      buttoncap.innerText = 'Scan Another';
    } else if (buttoncap.innerText == 'Scan Another') {
      buttoncap.innerText = 'Capture';
    }
  }

  function loadingstart() {
    loading.style.display = 'inline-block';
    overlay.style.display = 'flex';
  }

  function loadingfinish() {
    loading.style.display = 'none';
    overlay.style.display = 'none';
  }

  const initialize = async () => {
    model = await cocoSsd.load();
    await setupWebcam();
    loadingfinish();
    sessionStorage.setItem(
      'goods',
      JSON.stringify([
        'Sun protection umbrella',
        'Walking Stick',
        'HomePod Mini Blue',
        'Apple Watch Ultra 2 GPS + Cellular',
      ])
    );
    document.getElementById('capture').addEventListener('click', detectObjects);
    recommend();
  };

  function detectresult() {
    $.get('assets/tips.json', function (data) {
      console.log('Data fetched successfully!');
      console.log(data);

      let List = JSON.parse(sessionStorage.getItem('detectedItems'));
      console.log(List);
      let tipsboard = document.getElementById('tips');
      let set = new Set(List);
      tipsboard.innerHTML = '';
      set.forEach((itemName) => {
        let filteredItem = data.find((item) => item.item === itemName);

        if (filteredItem) {
          let cardHTML = `<p style="font-family: 'Roboto', sans-serif;" class="fs-4 mx-3 fw-semibold">
                    ${
                      filteredItem.categories === '1'
                        ? '✅'
                        : filteredItem.categories === '2'
                        ? '🔎'
                        : filteredItem.categories === '3'
                        ? '🧳'
                        : filteredItem.categories === '4'
                        ? '👜'
                        : filteredItem.categories === '5'
                        ? '❌'
                        : filteredItem.categories
                    }
                    ${filteredItem.item} ${filteredItem.detail}. ${filteredItem.tips}
                    </p>`;
          console.log(filteredItem);
          tipsboard.innerHTML += cardHTML;
          loadingfinish();
        }
      });
    });
  }
  initialize();

  let destination = document.getElementById('destination');
  destination.addEventListener('change', function () {
    main();
    let destvalue = this.value;
    if (destvalue == 'default') {
      alert('Please select a destination first');
    } else {
      console.log(destvalue);
    }
  });

  function extractItemsFromString(str) {
    let regex = /\[(.*?)\]/;
    let matched = String(str).match(regex);

    if (matched) {
      let items = matched[1].split(',');
      sessionStorage.setItem('goods', JSON.stringify(items));
      console.log('Goods:' + items);
      return items; // 如果你想让函数返回这些项目，而不仅仅是在控制台中打印它们
    } else {
      console.log('No items found in brackets');
      return null; // 如果在字符串中找不到项目，返回 null
    }
  }

  async function main() {
    let destination = document.getElementById('destination');

    destination.addEventListener('change', async function () {
      let str;

      if (this.value !== 'default') {
        const res = await fetch('http://localhost:3000/recommend/' + this.value);
        const data = await res.json();
        str = data.recommendations;
      } else {
        str =
          'Beijing, the heart of China... [GPS Bicycle meter,Sun protection umbrella,Walking Stick,Shaped Eye Mask]';
      }
      console.log(str);
      extractItemsFromString(str);
      recommend();
    });
  }

  function recommend() {
    $(document).ready(function () {
      $.get('assets/goods.json', function (data) {
        let goodsList = JSON.parse(sessionStorage.getItem('goods'));
        console.log('Data fetched successfully!');
        console.log(data);
        let element = document.getElementById('goods-menu');
        element.innerHTML = '';
        let id = 0;
        goodsList.forEach((drink) => {
          let goodfind = data.find((item) => item.name.trim() === drink);
          $('#goods-menu').append(`<div class='col d-flex justify-content-center' id="${id}"></div>`);
          let container = document.getElementById(id);
          let cardHTML = `
                  <a href="${goodfind.href}" class="text-decoration-none">
                      <div class="card mb-3" style="width: 18rem;" >
                      <img src="${goodfind.image}" class="card-img-top" alt="${goodfind.name}" style=" max-width: 60%; height: 200px;display: block;object-fit: cover; margin: auto;>
                      <div class="card-body">
                          <h5 class="card-title fw-semibold mx-auto">${goodfind.name}</h5>
                          <p class="badge bg-success position-absolute top-0 start-0 fs-6">${goodfind.type}</p>
                          <p class="card-text mx-auto">HKD${goodfind.price} <img src="assets/asiamiles.png" style="max-width:1.5rem">${goodfind.point}</p>
                      </div>
                      </div>
                  </a>
              `;
          id++;
          container.innerHTML += cardHTML;
        });
      }).fail(function (error) {
        //console.error('An error has occurred:');
        //console.error(error);
        $('#goods-menu').html('<div></div>').removeClass('row-cols-1 row-cols-sm-2 row-cols-md-4');
        $('#goods-menu > div')
          .text('Failed to fetch drink menu. Please try it again later.')
          .hide()
          .addClass('alert alert-danger')
          .fadeIn(1000);
      });
    });
  }

  let destvalue = this.value;
  if (destvalue == 'default') {
    alert('Please select a destination first');
  } else {
    console.log(destvalue);
  }
};
