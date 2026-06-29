function isYouTube(url) { return url.includes('youtube.com') || url.includes('youtu.be'); }
function isVimeo(url) { return url.includes('vimeo.com'); }

function getYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1];
}

function getVimeoId(url) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1];
}

export default function decorate(block) {
  const link = block.querySelector('a');
  const url = link?.href || '';

  if (!url) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'video-wrapper';

  if (isYouTube(url)) {
    const id = getYouTubeId(url);
    wrapper.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="YouTube video"></iframe>`;
  } else if (isVimeo(url)) {
    const id = getVimeoId(url);
    wrapper.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="Vimeo video"></iframe>`;
  } else {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.loading = 'lazy';
    wrapper.append(video);
  }

  block.textContent = '';
  block.append(wrapper);
}
