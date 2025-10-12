import {preloadImages} from './utils.js'

gsap.registerPlugin(Draggable)

class Grid {
    constructor() {
        this.dom = document.querySelector(".container")
        this.grid = document.querySelector(".grid")
        this.products = [...document.querySelectorAll(".product div")]

        this.details = document.querySelector(".details")
        this.detailsThumb = this.details.querySelector(".details__thumb")

        this.isDragging = false
    }

    init() {
        this.intro()
    }

    intro() {
        this.centerGrid()

        const timeline = gsap.timeline()

        timeline.set(this.dom, {scale: .5})
        timeline.set(this.products, {
            scale: 0.5,
            opacity: 0,
        })

        timeline.to(this.products, {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: {
                amount: 1.2,
                from: "random"
            }
        })
        timeline.to(this.dom, {
            scale: 1,
            duration: 1.2,
            ease: "power3.inOut",
            onComplete: () => {
                this.setupDraggable()
                this.addEvents()
                this.observeProducts()
                this.handleDetails()
            }
        })
    }

    centerGrid() {
        const gridWidth = this.grid.offsetWidth
        const gridHeight = this.grid.offsetHeight
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        const centerX = (windowWidth - gridWidth) / 2
        const centerY = (windowHeight - gridHeight) / 2

        gsap.set(this.grid, {
            x: centerX,
            y: centerY
        })
    }

    setupDraggable() {
        this.dom.classList.add("--is-loaded")

        this.draggable = Draggable.create(this.grid, {
            type: "x,y",
            bounds: {
                minX: -(this.grid.offsetWidth - window.innerWidth) - 200,
                maxX: 200,
                minY: -(this.grid.offsetHeight - window.innerHeight) - 100,
                maxY: 100
            },
            inertia: true,
            allowEventDefault: true,
            edgeResistance: 0.9,

            onDragStart: () => {
                this.isDragging = true
                this.grid.classList.add("--is-dragging")
            },

            onDragEnd: () => {
                this.isDragging = false
                this.grid.classList.remove("--is-dragging")
            }
        })[0]
    }

    addEvents() {
        window.addEventListener("wheel", (e) => {
            e.preventDefault()

            const deltaX = -e.deltaX * 7
            const deltaY = -e.deltaY * 7

            const currentX = gsap.getProperty(this.grid, "x")
            const currentY = gsap.getProperty(this.grid, "y")

            const newX = currentX + deltaX
            const newY = currentY + deltaY

            const bounds = this.draggable.vars.bounds
            const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, newX))
            const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, newY))

            gsap.to(this.grid, {
                x: clampedX,
                y: clampedY,
                duration: 0.3,
                ease: "power3.out"
            })
        }, {passive: false})

        window.addEventListener("resize", () => {
            this.updateBounds()
        })
    }

    updateBounds() {
        if (this.draggable) {
            this.draggable.vars.bounds = {
                minX: -(this.grid.offsetWidth - window.innerWidth) - 50,
                maxX: 50,
                minY: -(this.grid.offsetHeight - window.innerHeight) - 50,
                maxY: 50
            }
        }
    }

    observeProducts() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {

                if (entry.target === this.currentProduct) return

                if (entry.isIntersecting) {
                    gsap.to(entry.target, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    })
                } else {
                    gsap.to(entry.target, {
                        opacity: 0,
                        scale: 0.5,
                        duration: 0.5,
                        ease: "power2.in"
                    })
                }
            })
        }, {
            root: null,
            threshold: 0.1
        })

        this.products.forEach(product => {
            observer.observe(product)
        })
    }

    handleDetails() {
        this.SHOW_DETAILS = false

        this.titles = this.details.querySelectorAll(".details__title p")
        this.texts = this.details.querySelectorAll(".details__body [data-text]")

        this.products.forEach(product => {
            product.addEventListener("click", (e) => {
                e.stopPropagation()
                this.showDetails(product)
            })
        })

        this.dom.addEventListener("click", (e) => {
            if (this.SHOW_DETAILS) {
                this.hideDetails()
            }
        })

        this.details.addEventListener("click", (e) => {
            e.stopPropagation();
            this.hideDetails()
        })
    }

    showDetails(product) {
        this.SHOW_DETAILS = true

        this.dom.classList.add("--is-details-showing")
        this.details.classList.add("--is-showing")

        gsap.to(this.dom, {
            x: "-50vw",
            duration: 1.2,
            ease: "power3.inOut",
        });

        this.flipProduct(product)
    }

    hideDetails() {
        this.SHOW_DETAILS = false

        this.dom.classList.remove("--is-details-showing")

        this.details.classList.remove("--is-showing")

        gsap.to(this.dom, {
            x: 0,
            duration: 1.2,
            delay: .3,
            ease: "power3.inOut",
        })

        this.unFlipProduct()

        this.titles.forEach(title => {
            gsap.to(title.querySelectorAll(".char"), {
                y: "100%",
                duration: 0.6,
                ease: "power3.inOut",
                stagger: {
                    amount: 0.025,
                    from: "end"
                }
            })
        })

        this.texts.forEach(text => {
            gsap.to(text.querySelectorAll(".line"), {
                y: "100%",
                duration: 0.6,
                ease: "power3.inOut",
                stagger: 0.05,
            })
        })
    }

    flipProduct(product) {
        if (this.currentProduct) {
            this.unFlipProduct()
        }

        this.currentProduct = product
        this.originalParent = product.parentNode
        const dataId = product.getAttribute("data-id")
        this.currentDetails = document.querySelector(`.details__texts [data-desc="${dataId}"]`)
        gsap.to(this.currentDetails, {
            opacity: 1,
        })
    }

    unFlipProduct() {
        if (!this.currentProduct || !this.originalParent) return

        gsap.to(this.currentDetails, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
        })

        this.currentProduct = null
        this.originalParent = null
        this.currentDetails = null

    }
}

const grid = new Grid()

preloadImages('.grid img').then(() => {
    grid.init()
    document.body.classList.remove('loading')
})
