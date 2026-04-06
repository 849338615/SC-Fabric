const { useEffect, useRef } = React;

const CyberBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    setCanvasSize();
    
    let particles = [];
    const colors = ['#4a7cff', '#00e5c8', '#3860c4'];
    
    const mouse = {
      x: null,
      y: null,
      radius: 180
    };
    
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    
    const handleResize = () => {
      setCanvasSize();
      init();
    };
    window.addEventListener('resize', handleResize);
    
    class Particle {
      constructor(x, y, dx, dy, size, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.color = color;
        this.density = (Math.random() * 20) + 5;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; 
      }
      
      update() {
        if (this.x > width || this.x < 0) this.dx = -this.dx;
        if (this.y > height || this.y < 0) this.dy = -this.dy;
        
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = (forceDirectionX * force * this.density) * 0.6;
            let directionY = (forceDirectionY * force * this.density) * 0.6;
            
            this.x -= directionX;
            this.y -= directionY;
          }
        }
        
        this.x += this.dx;
        this.y += this.dy;
        
        this.draw();
      }
    }
    
    function init() {
      particles = [];
      let numberOfParticles = Math.floor((width * height) / 12000);
      if (numberOfParticles > 200) numberOfParticles = 200; 
      if (numberOfParticles < 40) numberOfParticles = 40;   
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = Math.random() * (width - size * 2) + size;
        let y = Math.random() * (height - size * 2) + size;
        let dx = (Math.random() - 0.5) * 0.8; 
        let dy = (Math.random() - 0.5) * 0.8;
        let color = colors[Math.floor(Math.random() * colors.length)];
        
        particles.push(new Particle(x, y, dx, dy, size, color));
      }
    }
    
    function connect() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
            + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
            
          let maxDistToConnect = (width * height) / 60;
          if (maxDistToConnect > 25000) maxDistToConnect = 25000;
          
          if (distance < maxDistToConnect) {
            let opacityValue = 1 - (distance / maxDistToConnect);
            
            let distToMouse = 99999;
            if (mouse.x && mouse.y) {
              distToMouse = Math.sqrt(
                Math.pow(mouse.x - particles[a].x, 2) + 
                Math.pow(mouse.y - particles[a].y, 2)
              );
            }
            
            if (distToMouse < mouse.radius) {
                ctx.strokeStyle = `rgba(0, 229, 200, ${opacityValue * 0.8})`; 
            } else {
                ctx.strokeStyle = `rgba(74, 124, 255, ${opacityValue * 0.35})`;
            }
            
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }
    
    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    }
    
    init();
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return React.createElement('canvas', {
    ref: canvasRef,
    style: {
      display: 'block',
      width: '100%',
      height: '100%',
      background: 'transparent'
    }
  });
};

window.addEventListener('DOMContentLoaded', () => {
  const rootNode = document.getElementById('hero-react-bg');
  if (rootNode) {
    const root = ReactDOM.createRoot(rootNode);
    root.render(React.createElement(CyberBackground));
  }
});
