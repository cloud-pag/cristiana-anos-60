// Música de fundo controlada por botão (requer interação do usuário para autoplay funcionar)
const music = document.getElementById('bgMusic');
const toggle = document.getElementById('musicToggle');
if (toggle && music){
  let playing = false;
  const update = () => toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
  toggle.addEventListener('click', async () => {
    try{
      if (!playing){
        await music.play();
        music.currentTime = 45; // começa a tocar a partir de 45 segundos
        await music.play();
        playing = true;
        toggle.textContent = '⏸️ Pausar música';
      } else {
        music.pause();
        playing = false;
        toggle.textContent = '▶️ Tocar música';
      }
      update();
    }catch(e){
      console.warn('Falha ao iniciar áudio. Verifique o arquivo em assets/musica.mp3', e);
    }
  });
  update();
}
