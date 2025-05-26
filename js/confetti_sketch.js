// Azra_Math_Game/js/confetti_sketch.js

let confettiSketchInstance = null; // To hold the p5 instance

// This function will be called from game.js to start the confetti
function startP5Confetti() {
    if (confettiSketchInstance) {
        confettiSketchInstance.startEffect(); // Tell existing instance to restart
        return;
    }
    // p5 instance mode:
    const sketch = (p) => {
        let particles = [];
        const numParticles = 100;
        let active = false;
        let duration = 2000; // milliseconds
        let startTime;

        p.setup = function() {
            let canvasContainer = document.getElementById('p5-canvas-container');
            let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
            cnv.parent(canvasContainer); // Attach canvas to our container
            cnv.style('display', 'none'); // Initially hidden
            p.noStroke();
        };

        p.startEffect = function() {
            particles = []; // Clear old particles
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle(p, p.random(p.width), p.random(-p.height, 0)));
            }
            active = true;
            startTime = p.millis();
            p.canvas.style.display = 'block'; // Show canvas
        }

        p.draw = function() {
            if (!active) {
                return;
            }

            p.clear(); // Clear canvas each frame for transparency over game

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].show();
                if (particles[i].isOffScreen()) {
                    // particles.splice(i, 1); // Option: remove when off-screen
                }
            }

            if (p.millis() - startTime > duration) {
                active = false;
                p.canvas.style.display = 'none'; // Hide canvas
                // particles = []; // Optional: clear particles immediately
            }
        };

        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        // Particle class
        class Particle {
            constructor(p5Instance, x, y) {
                this.p = p5Instance; // Reference to p5 instance
                this.pos = this.p.createVector(x, y);
                this.vel = this.p.createVector(this.p.random(-2, 2), this.p.random(2, 7)); // Start with downward velocity
                this.acc = this.p.createVector(0, 0.1); // Gravity
                this.size = this.p.random(8, 16);
                this.color = this.p.color(this.p.random(255), this.p.random(255), this.p.random(255), 200); // RGBA
                this.angle = this.p.random(this.p.TWO_PI);
                this.rotationSpeed = this.p.random(-0.1, 0.1);
            }

            update() {
                this.vel.add(this.acc);
                this.pos.add(this.vel);
                this.angle += this.rotationSpeed;

                // Simple wind effect (optional)
                if (this.p.random() < 0.01) {
                    this.vel.x += this.p.random(-1, 1);
                }
            }

            show() {
                this.p.push();
                this.p.translate(this.pos.x, this.pos.y);
                this.p.rotate(this.angle);
                this.p.fill(this.color);
                this.p.rectMode(this.p.CENTER);
                this.p.rect(0, 0, this.size, this.size / 2); // Rectangular confetti
                this.p.pop();
            }

            isOffScreen() {
                return (this.pos.y > this.p.height + this.size);
            }
        }
    };

    // Create the p5 instance
    confettiSketchInstance = new p5(sketch);
}