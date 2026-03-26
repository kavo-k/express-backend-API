const carsContainer = document.getElementById("carsContainer");
const btnStart = document.getElementById("start");
const addCarBtn = document.getElementById("addCarBtn");
const deleteCarBtn = document.getElementById("deleteCarBtn");
const message = document.getElementById("message");
const timer = document.getElementById("timer");
const timesContainer = document.getElementById("timesContainer");

let trackLength = 0;
let drivers = [];

let startTime = performance.now();
console.log(startTime);

let elapseMs = 0;

updateTrackLength()

window.addEventListener("resize", updateTrackLength)


function updateTrackLength() {

  const row = document.querySelector('.race-row');
  const car = document.querySelector('.car');

  if (!row || !car) return;
  trackLength = row.clientWidth - car.offsetWidth;

  console.log(row.clientWidth);

};




function Racer(name, element) {
  this.name = name;
  this.element = element;
  this.position = 0;

  this.updateCarPosition = function (position) {
    this.position = position;
    this.element.style.left = this.position + 'px';
  }

  this.move = function () {
    const randomDistance = Math.floor(Math.random() * 1.1) + 1 + this.position;
    this.updateCarPosition(randomDistance);
  }

  console.log(name, element);

}

function declareWinner() {
  for (let i = 0; i < drivers.length; i++) {
    if (drivers[i].position >= trackLength - 80) {
      return drivers[i];
    }
  }
}


btnStart.addEventListener('click', () => {
  startTime = performance.now();
  elapseMs = 0;
  drivers = [];
  const cars = document.querySelectorAll(".car");
  console.log(cars);
  if (cars.length > 1) {


    for (let i = 0; i < cars.length; i++) {
      drivers.push(new Racer(`${i + 1} car`, cars[i]));
      drivers[i].updateCarPosition(0);
    }
    console.log(drivers);

    const raceInterval = setInterval(() => {
      winner = declareWinner();

      if (!winner) {
        elapseMs = performance.now() - startTime;
        timer.innerHTML = `timer: ${Math.floor(elapseMs / 1000)}:${Math.floor(elapseMs % 1000)}`;
      }

      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];
        driver.move();

        if (winner) {
          message.innerHTML = `${winner.name} победил`;

          const timerElement = document.createElement('div');
          timerElement.classList.add('time-row');

          const bestTime = `${winner.name} - ${timer.textContent}`;

          timerElement.textContent = bestTime;
          timesContainer.appendChild(timerElement);
          console.log(timer);

          clearInterval(raceInterval);
          btnStart.disabled = false;
          addCarBtn.disabled = false;
          deleteCarBtn.disabled = false;
          return;
        };
      }
    }, 10)



    btnStart.disabled = true;
    addCarBtn.disabled = true;
    deleteCarBtn.disabled = true;

  }
});



function CreateCar() {
  const carElement = document.createElement("div");
  carElement.classList.add("race-row");

  const car = document.createElement('div');
  car.classList.add('car');

  const numberCar = document.createElement('div');
  numberCar.classList.add('numberCar');

  let nextNumber = document.querySelectorAll(".car").length + 1;


  numberCar.innerHTML = `${nextNumber}`;

  carElement.appendChild(car);
  car.appendChild(numberCar);
  return carElement;
};

addCarBtn.onclick = () => {
  const carElement = CreateCar();
  carsContainer.appendChild(carElement);
};

deleteCarBtn.onclick = () => {
  const deleteElement = carsContainer.lastElementChild;

  if (deleteElement) deleteElement.remove();
}