import Flowers from "./data";
import { Slider } from "./slider";

document.addEventListener("DOMContentLoaded", () => {
  //Open modal window
  const Open_Burger_Menu = document.querySelector(".header__menu-burger");
  const header__list = document.querySelector(".header__list");
  const Arrow_CLose = document.querySelector(".arrow-close") as HTMLElement;
  Open_Burger_Menu?.addEventListener("click", () => {
    if (header__list && Arrow_CLose) {
      header__list.classList.add("header__list--active");
      Arrow_CLose.style.display = "block";
    }
  });

  //Close modal window
  const Close_Burger_Menu = document.querySelector(".arrow-close");
  Close_Burger_Menu?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (Open_Burger_Menu && header__list) {
      header__list.classList.add("anim-fade-out");

      setTimeout(() => {
        header__list.classList.remove("header__list--active");
        header__list.classList.remove("anim-fade-out");
        Arrow_CLose.style.display = "none";
      }, 300);
    }
  });

  type FlowersData = {
    data: Flower[] | null;
  };
  const FlowersData: FlowersData = {
    data: null,
  };
  /*
      Clients slide
    */
  const clientsList: HTMLDivElement | null =
    document.querySelector(".clients__list");
  const clientsItem: HTMLDivElement[] = Array.from(
    document.querySelectorAll<HTMLDivElement>(".clients__item")
  );

  const clientsSlider = new Slider(clientsList, clientsItem, "clients__active");

  /*
    Slider's buttons (prev and next)
  */
  const sliderNext: HTMLDivElement | null =
    document.querySelector(".slider__next");
  const sliderPrev: HTMLDivElement | null =
    document.querySelector(".slider__prev");

  // Buuton next
  sliderNext?.addEventListener("click", () => {
    const itemWidth = clientsSlider.itemFullWidth(clientsItem[0]);

    if (clientsList) {
      if (clientsSlider.currentIndex >= clientsItem.length - 1) {
        clientsSlider.currentIndex = clientsItem.length - 1;
        const offset = itemWidth * clientsSlider.currentIndex * -1;
        clientsSlider.setSliderPosition(offset);
      } else {
        clientsSlider.currentIndex += 1;
        const offset = itemWidth * clientsSlider.currentIndex * -1;
        clientsSlider.setSliderPosition(offset);
      }
    }
  });

  // Button prev
  sliderPrev?.addEventListener("click", () => {
    const itemWidth = clientsSlider.itemFullWidth(clientsItem[0]);

    if (clientsList) {
      if (clientsSlider.currentIndex <= 0) {
        clientsSlider.currentIndex = 0;
        const offset = itemWidth * clientsSlider.currentIndex * -1;
        clientsSlider.setSliderPosition(offset);
      } else {
        clientsSlider.currentIndex -= 1;
        const offset = itemWidth * clientsSlider.currentIndex * -1;
        clientsSlider.setSliderPosition(offset);
      }
    }
  });

  // Button show more
  const showMoreBtn = document.querySelector(".slider__button-show");

  showMoreBtn?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.hasAttribute("data-full")) {
      target.removeAttribute("data-full");
      target.textContent = "Дивіться всі";
      visibleFlowers = 6;
      if (flowerList && FlowersData.data) {
        flowerList.innerHTML = drawVisibleFlowers(
          FlowersData.data,
          visibleFlowers
        );
      }
    } else {
      target.setAttribute("data-full", "true");
      target.textContent = "Закрити";
      visibleFlowers = 9;
      if (flowerList && FlowersData.data) {
        flowerList.innerHTML = drawVisibleFlowers(
          FlowersData.data,
          visibleFlowers
        );
      }
    }
  });
  /////////////////////////////////////////////////////

  /*
    Flowers slider
  */
  const flowerList: HTMLDivElement | null =
    document.querySelector(".slider__list");

  interface Flower {
    oldPrice: string;
    currentPrice: string;
    subtitle: string;
    buttonText: string;
    image: string;
  }

  let visibleFlowers = 6;
  /// Load fake data from "data.json" file
  loadFlowers().then((data) => {
    if (flowerList) {
      FlowersData.data = data;
      flowerList.innerHTML = drawVisibleFlowers(
        FlowersData.data,
        visibleFlowers
      );
      fnFlowers();
    }
  });

  function drawVisibleFlowers(flowers: Flower[], count: number): string {
    let html = "";
    if (flowers.length < count) {
      console.error("The array of flowers is shorter than the count.");
      return "";
    }
    for (let i = 0; i < count; i++) {
      html += `
        <div class="${
          i == 0 ? "slider__item slider__item--active" : "slider__item"
        }">
          <img src="${flowers[i].image}" alt="">
          ${
            flowers[i].buttonText
              ? `<button class="button slider__button">${flowers[i].buttonText}</button>`
              : ""
          }
          <div class="slider__price">
            <span class="current-price">${flowers[i].currentPrice}</span>
            <span class="old-price">${flowers[i].oldPrice}</span>
          </div>
          <div class="slider__bottom">
            ${flowers[i].subtitle}
          </div>
        </div>
      `;
    }
    return html;
  }

  async function loadFlowers(): Promise<Flower[]> {
    return new Promise((res) => {
      setTimeout(() => {
        const result = Flowers;
        res(result);
      }, 1000);
    });
  }

  function fnFlowers() {
    if (window.innerWidth < 1150) {
      const flowerItems = Array.from(
        document.querySelectorAll<HTMLDivElement>(".slider__item")
      );

      const flowersSlider = new Slider(
        flowerList,
        flowerItems,
        "slider__item--active"
      );

      addEventListenerWidthLess1150px(flowerItems, flowersSlider);

      flowersSlider.setCenterSlide(flowersSlider.currentIndex);
      flowersSlider.changeActiveSlide(flowersSlider.currentIndex);
    }
  }

  function addEventListenerWidthLess1150px(
    array: HTMLDivElement[],
    slider: Slider
  ) {
    array.forEach((item, index) => {
      const sliderImage = item.querySelector("img");
      if (sliderImage) {
        sliderImage.removeEventListener("dragstart", (e) => e.preventDefault());
      }

      // Touch Events
      item.addEventListener("touchstart", slider.touchStart(index));
      item.addEventListener("touchend", (e) => slider.touchEnd(e));
      item.addEventListener("touchmove", (e) => slider.touchMove(e));

      // Mouse Events
      item.addEventListener("mousedown", slider.touchStart(index));
      item.addEventListener("mouseup", slider.touchEnd);
      item.addEventListener("mousedown", slider.touchEnd);
      item.addEventListener("mousedown", slider.touchMove);
    });
  }

  if (window.innerWidth < 921) {
    addEventListenerWidthLess1150px(clientsItem, clientsSlider);
    clientsSlider.setCenterSlide(clientsSlider.currentIndex);
    clientsSlider.changeActiveSlide(clientsSlider.currentIndex);
  }
});
