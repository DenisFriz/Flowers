export class Slider {
  container: HTMLDivElement | null;
  items: HTMLDivElement[] | null;
  currentIndex: number;
  isDragging: boolean;
  startPositionX: number;
  currentTranslate: number;
  prevTranslate: number;
  animationID: number;

  activeClassName: string;

  constructor(
    container: HTMLDivElement | null,
    items: HTMLDivElement[] | null,
    activeClassName: string
  ) {
    this.container = container;
    this.items = items;
    this.currentIndex = 0;
    this.isDragging = false;
    this.startPositionX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = -1;

    this.activeClassName = activeClassName;
  }

  setCenterSlide(index: number): void {
    if (this.container && this.items) {
      const FULL_WIDTH_CONTAINER: number = this.itemFullWidth(this.container);
      const FULL_WIDTH_ITEM: number = this.itemFullWidth(this.items[0]);

      const offset: number =
        FULL_WIDTH_CONTAINER / 2 -
        FULL_WIDTH_ITEM / 2 -
        FULL_WIDTH_ITEM * index;
      830 / 2 - 222 / 2 - 222 * 0;
      this.setSliderPosition(offset);
    }
  }

  setSliderPosition(offset?: number): void {
    if (this.container)
      this.container.style.transform = `translateX(${offset}px)`;
  }

  getPosX(e: MouseEvent | TouchEvent): number {
    if (e instanceof MouseEvent) {
      return e.pageX;
    } else if (e instanceof TouchEvent) {
      return e.touches[0].clientX;
    }
    return 0;
  }

  touchStart(index: number): (e: MouseEvent | TouchEvent) => void {
    return (e: MouseEvent | TouchEvent) => {
      this.startPositionX = this.getPosX(e);
      this.isDragging = true;

      this.animationID = requestAnimationFrame(this.animation);
    };
  }

  animation = (): void => {
    this.setSliderPosition();
    if (this.isDragging) {
      requestAnimationFrame(this.animation);
    }
  };

  touchEnd(e: MouseEvent | TouchEvent): void {
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -10) {
      this.currentIndex += 1;
    }
    if (movedBy > 10) {
      this.currentIndex -= 1;
    }

    if (this.currentIndex <= 0) {
      this.currentIndex = 0;
    }
    if (this.items)
      if (this.currentIndex >= this.items?.length - 1) {
        this.currentIndex = this.items?.length - 1;
      }

    this.setCenterSlide(this.currentIndex);
    this.changeActiveSlide(this.currentIndex);
  }

  touchMove(event: MouseEvent | TouchEvent) {
    if (this.isDragging) {
      const currentPosition = this.getPosX(event);
      this.currentTranslate =
        this.prevTranslate + currentPosition - this.startPositionX;
    }
  }

  changeActiveSlide(index: number) {
    if (this.items && index >= 0 && index < this.items.length) {
      // Remove `nameClass` from all items
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].classList.remove(this.activeClassName);
      }

      // Add `nameClass` to the specified item
      this.items[index].classList.add(this.activeClassName);
    } else if (index <= 0) {
      index = 0;
    } else {
      console.error(
        `Invalid index (${index}) or items array in changeActiveSlide.`
      );
    }
  }

  itemFullWidth(item: HTMLDivElement) {
    return (
      item.getBoundingClientRect().width +
      parseInt(window.getComputedStyle(item).marginLeft, 10) +
      parseInt(window.getComputedStyle(item).marginRight, 10)
    );
  }
}
