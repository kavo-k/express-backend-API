const carsContainer = document.getElementById("carsContainer");
const btnStart = document.getElementById("start");
const addCarBtn = document.getElementById("addCarBtn");
const deleteCarBtn = document.getElementById("deleteCarBtn");

// function () {
//   this.position = 0;



  

//   return CreateRace();
// }

function CreateCar() {
  carElement = document.createElement("div");
  carElement.classList.add("race-row");

  car = document.createElement('div');
  car.classList.add('car');

  carElement.appendChild(car);
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