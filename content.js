(() => {
  const SKEY = "yt_autoreplay_settings";

  const getSettings = () =>
    new Promise(res => chrome.storage.sync.get(
      { [SKEY]: { enabled: true, mode: "loop", delayMs: 0 } },
      v => res(v[SKEY])
    ));

  const setLoop = (video, on) => {
    if (!video) return;
    video.loop = !!on;
    if (on) {
      // make sure it plays
      if (video.paused) video.play().catch(()=>{});
    }
  };

  const bindEnded = (video, delayMs) => {
    if (!video) return;
    const handler = () => {
      setTimeout(() => {
        // simple refresh
        location.reload();
      }, Math.max(0, delayMs|0));
    };
    // avoid multiple binds
    video.removeEventListener("ended", handler);
    video.addEventListener("ended", handler, { once: true });
  };

  const findVideo = () => document.querySelector("video");

  const apply = async () => {
    const cfg = await getSettings();
    if (!cfg.enabled) return;

    const video = findVideo();
    if (!video) return;

    // clear previous state
    video.loop = false;
    video.onended = null;

    if (cfg.mode === "loop") {
      setLoop(video, true);
    } else {
      // mode === "refresh"
      setLoop(video, false);
      bindEnded(video, cfg.delayMs || 0);
    }
  };

  // handle SPA nav on YouTube
  const hookSpa = () => {
    document.addEventListener("yt-navigate-finish", apply);
    document.addEventListener("yt-page-data-updated", apply);
  };

  const observeVideoReplacement = () => {
    const obs = new MutationObserver(() => {
      // when video element swaps, re-apply
      apply();
    });
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  };

  // kick off
  hookSpa();
  observeVideoReplacement();
  // initial try, then retry a few times for late player
  apply();
  let tries = 0;
  const t = setInterval(() => {
    tries++;
    apply();
    if (tries >= 10) clearInterval(t);
  }, 800);
})();
