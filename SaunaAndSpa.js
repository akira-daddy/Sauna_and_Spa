/* ============================================
   YUGE Sauna & Spa — Landing Page Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll Fade-in Animation
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // 2. FAQ Accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });

  // 3. Sticky CTA visibility — hide when hero CTA is visible
  const heroCTA = document.querySelector('#hero .btn-primary');
  const stickyCTA = document.querySelector('#sticky-cta');
  if (heroCTA && stickyCTA) {
    const obs2 = new IntersectionObserver(
      entries => {
        stickyCTA.style.transform = entries[0].isIntersecting
          ? 'translateY(100%)'
          : 'translateY(0)';
      },
      { threshold: 0 }
    );
    obs2.observe(heroCTA);
  }

  // 4. Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      const target = document.querySelector(btn.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  // 5. パララックス効果
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length > 0) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxElements.forEach(el => {
            if (el.classList.contains('fade-in') && !el.classList.contains('visible')) return;
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            const rect = el.getBoundingClientRect();
            const inView = rect.bottom > 0 && rect.top < window.innerHeight;
            if (inView) {
              const offset = (scrollY - el.offsetTop + window.innerHeight) * speed;
              el.style.transform = `translateY(${offset}px)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Hero背景のパララックス
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    let heroTicking = false;
    window.addEventListener('scroll', () => {
      if (!heroTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroH = document.getElementById('hero')?.offsetHeight || 800;
          if (scrollY < heroH) {
            heroBg.style.transform = `translateY(${scrollY * 0.4}px) scale(1.1)`;
          }
          heroTicking = false;
        });
        heroTicking = true;
      }
    });
  }

  // セクション見出しのパララックス（微かに浮遊）
  // ※ fade-in の visible クラスが付いた要素のみ対象（未表示の要素は除外）
  const sectionLabels = document.querySelectorAll('.section-label');
  const sectionH2s    = document.querySelectorAll('section > h2');
  if (sectionLabels.length > 0 || sectionH2s.length > 0) {
    let labelTicking = false;
    window.addEventListener('scroll', () => {
      if (!labelTicking) {
        requestAnimationFrame(() => {
          [...sectionLabels, ...sectionH2s].forEach(el => {
            // fade-in クラスを持つ要素は visible になるまでスキップ
            if (el.classList.contains('fade-in') && !el.classList.contains('visible')) return;

            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
              const offset = (1 - progress) * 20;
              el.style.transform = `translateY(${offset}px)`;
            }
          });
          labelTicking = false;
        });
        labelTicking = true;
      }
    });
  }

  // 6. 施設設備紹介 CSSマーキー方式エンドレス横スクロール
  // - cloneNode(true)で複製 → 複製側のimgにloading="lazy"を付与
  // - スクロール幅をJSで計算しCSS変数(--marquee-width)にセット → 正確なループ
  const showcase = document.querySelector('.facility-showcase');
  if (showcase) {
    const track   = showcase.querySelector('.showcase-track');
    const prevBtn = showcase.querySelector('.showcase-prev');
    const nextBtn = showcase.querySelector('.showcase-next');

    if (track) {
      // アニメーションを一旦止めて幅を正確に計測
      track.style.animation = 'none';

      const originalCards = Array.from(track.children);

      // cloneNode(true)で複製し、複製側のimgにloading="lazy"を付与
      originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.querySelectorAll('img').forEach(img => {
          img.setAttribute('loading', 'lazy');
        });
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });

      // オリジナル6枚分の実際の幅をpxで計算してCSS変数にセット
      function setMarqueeWidth() {
        track.style.animation = 'none';
        // 全カードのうち前半（オリジナル）の幅 + gap合計
        const cardCount = originalCards.length;
        const gapPx = 24; // CSSのgapと一致させる
        let originalWidth = 0;
        Array.from(track.children).slice(0, cardCount).forEach(card => {
          originalWidth += card.offsetWidth + gapPx;
        });
        track.style.setProperty('--marquee-width', originalWidth + 'px');
        // 強制リフローで再アニメーション開始
        void track.offsetWidth;
        track.style.animation = '';
      }

      // 初回計算（画像ロード後に再計算して正確な値を確保）
      setMarqueeWidth();
      window.addEventListener('load', setMarqueeWidth);
      window.addEventListener('resize', setMarqueeWidth);

      // 矢印ボタン: クリックで5秒間一時停止してから再開
      let pauseTimer = null;
      function pauseAndResume() {
        showcase.classList.add('paused');
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(() => {
          showcase.classList.remove('paused');
        }, 5000);
      }

      prevBtn?.addEventListener('click', pauseAndResume);
      nextBtn?.addEventListener('click', pauseAndResume);

      // タッチ操作でも一時停止
      track.addEventListener('touchstart', () => {
        showcase.classList.add('paused');
        clearTimeout(pauseTimer);
      }, { passive: true });

      track.addEventListener('touchend', () => {
        pauseTimer = setTimeout(() => {
          showcase.classList.remove('paused');
        }, 2000);
      }, { passive: true });
    }
  }

});
/* ============================================
   予約フォームモーダル
   ============================================ */

// ★ STEP 1でコピーしたGASのウェブアプリURLに置き換えてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxCyHbw86T-dDLADnPn9OtEP2ZKorvrTI9_AtIkl670CxvOTZE_lvQoOl0espwnioHfCw/exec';

// --- モーダルの開閉 ---
function openModal(plan = '') {
  const modal  = document.getElementById('reservation-modal');
  const select = document.getElementById('f-plan');
  const dateInput = document.getElementById('f-date');

  // プランを事前選択
  if (plan) {
    for (const opt of select.options) {
      if (opt.value.includes(plan)) { select.value = opt.value; break; }
    }
  }

  // 日付の最小値を今日に設定
  const today = new Date();
  dateInput.min = today.toISOString().split('T')[0];
  // 最大値を前日23:59まで（翌日以降を受付）
  // ※ キャンペーン終了日などはここで max を設定

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.form-control').focus();
}

function closeModal() {
  const modal = document.getElementById('reservation-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';

  // フォームの状態をリセット（エラー表示・touchedフラグを解除）
  const form = document.getElementById('reservation-form');
  if (form) {
    form.reset();
    form.style.display = '';
    const successEl = document.getElementById('form-success');
    if (successEl) successEl.style.display = 'none';

    form.querySelectorAll('.form-control, input[type="checkbox"]').forEach(field => {
      field.classList.remove('is-invalid', 'is-valid');
      delete field.dataset.touched;
    });
    form.querySelectorAll('.field-error').forEach(el => el.remove());

    const errDiv = document.getElementById('form-error');
    if (errDiv) errDiv.style.display = 'none';

    const submitBtn = document.getElementById('form-submit');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '予約を確定する';
    }
  }
}

window.closeModal = closeModal;
window.openModal = openModal;

// --- 全予約ボタンにイベントを付与 ---
document.addEventListener('DOMContentLoaded', () => {

  // CSSで #sticky-cta も含めて btn-primary / btn-secondary を拾う
  const reservationKeywords = ['予約', '空き枠', '確認', '体験', '女性専用'];

document.querySelectorAll(
  '.btn-primary:not(.btn-form-submit), .btn-sticky-primary, #sticky-cta a'
).forEach(btn => {
  const text = btn.textContent.trim();
  const isReservation = reservationKeywords.some(k => text.includes(k));
  if (isReservation) {
    btn.setAttribute('href', 'javascript:void(0)');
    btn.addEventListener('click', e => {
      e.preventDefault();

      // data-plan属性からプランを取得（なければ空）
      const plan = btn.dataset.plan || '';

      openModal(plan);
    });
  }
});

  // ✕ボタンクリックで閉じる
  document.getElementById('modal-close')
    ?.addEventListener('click', closeModal);

  // オーバーレイクリックで閉じる
  document.getElementById('modal-overlay')
    ?.addEventListener('click', closeModal);

  // Escキーで閉じる
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
  
/* ============================================
   フォームバリデーション
   ============================================ */

// バリデーションルール定義
const VALIDATION_RULES = {
  plan:     { required: true,  message: 'プランを選択してください' },
  date:     { required: true,  message: 'ご希望日を選択してください' },
  timeSlot: { required: true,  message: '時間帯を選択してください' },
  guests:   { required: true,  message: '人数を選択してください' },
  name:     { required: true,  message: 'お名前を入力してください' },
  email: {
    required: true,
    pattern:  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message:  '正しいメールアドレスを入力してください'
  },
  phone: {
    required: true,
    pattern:  /^[\d\-\+\(\)\s]{10,15}$/,
    message:  '正しい電話番号を入力してください（例：090-1234-5678）'
  },
  agree: { required: true, message: 'キャンセルポリシーへの同意が必要です' },
};

// 単一フィールドのバリデーション
function validateField(name, value, checked) {
  const rule = VALIDATION_RULES[name];
  if (!rule) return null; // ルール未定義は常にOK

  if (rule.required) {
    const isEmpty = name === 'agree' ? !checked : !value.trim();
    if (isEmpty) return rule.message;
  }
  if (rule.pattern && value.trim() && !rule.pattern.test(value.trim())) {
    return rule.message;
  }
  return null; // エラーなし
}

// フィールドにエラー状態を付与
function showFieldError(field, message) {
  field.classList.add('is-invalid');
  field.classList.remove('is-valid');

  let errEl = field.parentElement.querySelector('.field-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error';
    field.parentElement.appendChild(errEl);
  }
  errEl.textContent = message;
}

// フィールドのエラー状態を解除
function clearFieldError(field) {
  field.classList.remove('is-invalid');
  field.classList.add('is-valid');

  const errEl = field.parentElement.querySelector('.field-error');
  if (errEl) errEl.remove();
}

// フォーム全体のバリデーション（送信時）
function validateAll(form) {
  let isValid = true;
  let firstInvalidField = null;

  Object.keys(VALIDATION_RULES).forEach(name => {
    const field = form.elements[name];
    if (!field) return;

    const error = validateField(name, field.value, field.checked);
    if (error) {
      showFieldError(field, error);
      isValid = false;
      if (!firstInvalidField) firstInvalidField = field;
    } else {
      clearFieldError(field);
    }
  });

  // 最初のエラー箇所にスクロール
  if (firstInvalidField) {
    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

// リアルタイムバリデーション（blur時）
function attachRealtimeValidation(form) {
  Object.keys(VALIDATION_RULES).forEach(name => {
    const field = form.elements[name];
    if (!field) return;

    const eventType = (field.type === 'checkbox') ? 'change' : 'blur';

    field.addEventListener(eventType, () => {
      // 未入力のまま離脱した場合のみエラー表示（まだ触れていないフィールドは除く）
      if (field.dataset.touched !== 'true') return;
      const error = validateField(name, field.value, field.checked);
      if (error) {
        showFieldError(field, error);
      } else {
        clearFieldError(field);
      }
    });

    // 一度でも触れたフィールドにフラグを立てる
    field.addEventListener('focus', () => {
      field.dataset.touched = 'true';
    });
    // チェックボックスはclickで即判定
    if (field.type === 'checkbox') {
      field.addEventListener('click', () => {
        field.dataset.touched = 'true';
        const error = validateField(name, field.value, field.checked);
        if (error) {
          showFieldError(field, error);
        } else {
          clearFieldError(field);
        }
      });
    }
  });
}

// --- フォーム送信イベント ---
document.getElementById('reservation-form')
  ?.addEventListener('submit', async e => {
    e.preventDefault();

    const form   = e.target;
    const submit = document.getElementById('form-submit');
    const errDiv = document.getElementById('form-error');

    // 全フィールドを「触れた」扱いにしてバリデーション実施
    Object.keys(VALIDATION_RULES).forEach(name => {
      const field = form.elements[name];
      if (field) field.dataset.touched = 'true';
    });

    if (!validateAll(form)) return; // バリデーションNG → 送信しない

    // 送信中UI
    submit.disabled    = true;
    submit.textContent = '送信中…';
    errDiv.style.display = 'none';

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      // GASはCORSに非対応のため no-cors で送信
      // no-cors ではレスポンス内容を読めないが、送信自体は成功する
      await fetch(GAS_URL, {
        method: 'POST',
        mode:   'no-cors',
        body:   JSON.stringify(payload),
      });

      // no-cors の場合 opaque レスポンスとなるため
      // ネットワークエラーが起きなければ送信成功とみなす
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';

    } catch (err) {
      errDiv.textContent   = `エラーが発生しました：${err.message}。恐れ入りますが、お電話（03-1234-5678）にてご予約ください。`;
      errDiv.style.display = 'block';
      submit.disabled    = false;
      submit.textContent = '予約を確定する';
    }
  });

// リアルタイムバリデーションを起動
const reservationForm = document.getElementById('reservation-form');
if (reservationForm) attachRealtimeValidation(reservationForm);

});