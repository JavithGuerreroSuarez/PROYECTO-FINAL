/* ========= DOM READY ========= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- MENU TOGGLE (mobile) ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  // handled by CSS sibling selector; keep label clickable

  /* ---------- FAVORITOS (mini-cart) ---------- */
  const favoritosTbody = document.querySelector('#lista-favoritos tbody');
  const favoritos = new Map();
  document.querySelectorAll('.favorito-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const img = btn.dataset.img;
      if (!favoritos.has(id)) {
        favoritos.set(id, { id, title, img });
        renderFavoritos();
      } else {
        alert('Ya está en tus favoritos');
      }
    });
  });

  function renderFavoritos() {
    favoritosTbody.innerHTML = '';
    favoritos.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="width:50px"><img src="${item.img}" style="width:50px;height:32px;object-fit:cover;border-radius:4px"></td>
        <td>${item.title}</td>
        <td><button class="btn-3 remove-fav" data-id="${item.id}">Quitar</button></td>
      `;
      favoritosTbody.appendChild(tr);
    });
    // attach remove handlers
    document.querySelectorAll('.remove-fav').forEach(b => {
      b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.dataset.id;
        favoritos.delete(id);
        renderFavoritos();
      });
    });
  }

  document.getElementById('borrar-favoritos').addEventListener('click', (e) => {
    e.preventDefault();
    favoritos.clear();
    renderFavoritos();
  });

  /* ---------- LOAD MORE ---------- */
  const loadMoreBtn = document.getElementById('load-more');
  loadMoreBtn.addEventListener('click', () => {
    document.querySelectorAll('.box.hidden').forEach(b => b.classList.remove('hidden'));
    loadMoreBtn.style.display = 'none';
  });

  /* ---------- REVIEWS: STARS + EDIT + SEND + ADD NEW ---------- */
  const reviewsGrid = document.getElementById('reviews-grid');

  function createStarsContainer() {
    const div = document.createElement('div');
    div.className = 'stars';
    for (let i = 1; i <= 5; i++) {
      const span = document.createElement('span');
      span.className = 'star';
      span.dataset.value = i;
      span.textContent = '★';
      // hover effect
      span.addEventListener('mouseenter', () => {
        const siblings = Array.from(span.parentElement.children);
        siblings.forEach((s, idx) => s.classList.toggle('active', idx <= (i-1)));
      });
      // click => set rating (stays)
      span.addEventListener('click', () => {
        const siblings = Array.from(span.parentElement.children);
        siblings.forEach((s, idx) => s.classList.toggle('active', idx <= (i-1)));
        // store rating on parent card
        span.closest('.review-card').dataset.rating = i;
      });
      div.appendChild(span);
    }
    // mouseleave resets to current rating
    div.addEventListener('mouseleave', (ev) => {
      const card = div.closest('.review-card');
      const current = parseInt(card.dataset.rating || '0', 10);
      Array.from(div.children).forEach((s, idx) => s.classList.toggle('active', idx < current));
    });
    return div;
  }

  // initialize existing review-cards
  document.querySelectorAll('.review-card').forEach(card => {
    const starsDiv = card.querySelector('.stars');
    // fill stars (if empty)
    if (starsDiv.children.length === 0) {
      const newStars = createStarsContainer();
      starsDiv.replaceWith(newStars);
      card.querySelector('.stars').setAttribute('role','radiogroup');
    }

    // edit button
    const editBtn = card.querySelector('.edit-btn');
    const comment = card.querySelector('.comment');
    editBtn.addEventListener('click', () => {
      const isEditing = comment.contentEditable === 'true';
      if (isEditing) {
        comment.contentEditable = 'false';
        editBtn.textContent = '✏️ Editar';
        comment.blur();
      } else {
        comment.contentEditable = 'true';
        editBtn.textContent = '💾 Guardar';
        comment.focus();
      }
    });

    // send button: just validate + clear textarea
    const sendBtn = card.querySelector('.send-btn');
    sendBtn.addEventListener('click', () => {
      const text = card.querySelector('.comment').value || card.querySelector('.comment').textContent;
      if (!text || text.trim() === '') {
        alert('Escribe una reseña antes de enviar.');
        return;
      }
      // here we would POST to backend; for now just simulate success and clear
      alert('✅ Reseña enviada. (Se ha limpiado el campo)');
      card.querySelector('.comment').value = '';
      card.dataset.rating = 0;
      // reset stars visuals
      const stars = card.querySelectorAll('.star');
      stars.forEach(s => s.classList.remove('active'));
    });
  });

  // Add new review card
  document.getElementById('add-review').addEventListener('click', () => {
    const newCard = document.createElement('div');
    newCard.className = 'review-card';
    newCard.dataset.game = 'Nuevo';
    newCard.innerHTML = `
      <img src="https://via.placeholder.com/600x300" alt="Nuevo">
      <h3>Nuevo Videojuego</h3>
      <div class="stars"></div>
      <textarea class="comment" placeholder="Escribe tu reseña..."></textarea>
      <div class="review-actions">
        <button class="edit-btn">✏️ Editar</button>
        <button class="send-btn">Enviar</button>
      </div>
    `;
    reviewsGrid.appendChild(newCard);

    // initialize stars + buttons for new card
    const stars = createStarsContainer();
    newCard.querySelector('.stars').replaceWith(stars);

    newCard.querySelector('.edit-btn').addEventListener('click', () => {
      const comment = newCard.querySelector('.comment');
      const isEditing = comment.contentEditable === 'true';
      if (isEditing) {
        comment.contentEditable = 'false';
        newCard.querySelector('.edit-btn').textContent = '✏️ Editar';
      } else {
        comment.contentEditable = 'true';
        newCard.querySelector('.edit-btn').textContent = '💾 Guardar';
        comment.focus();
      }
    });

    newCard.querySelector('.send-btn').addEventListener('click', () => {
      const text = newCard.querySelector('.comment').value || newCard.querySelector('.comment').textContent;
      if (!text || text.trim() === '') { alert('Escribe algo antes de enviar'); return; }
      alert('Reseña enviada (nuevo) - campo limpiado');
      newCard.querySelector('.comment').value = '';
      newCard.dataset.rating = 0;
      Array.from(newCard.querySelectorAll('.star')).forEach(s => s.classList.remove('active'));
    });
  });

  /* ---------- ADD / EDIT GAME (Product cards) ---------- */
  // Edit inline: make title & description editable on double click
  document.querySelectorAll('.box').forEach(box => {
    const h3 = box.querySelector('h3');
    const desc = box.querySelector('.Descripcion');
    h3.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.value = h3.textContent;
      input.className = 'inline-edit';
      h3.replaceWith(input);
      input.focus();
      input.addEventListener('blur', () => {
        const newH3 = document.createElement('h3');
        newH3.textContent = input.value || 'Sin título';
        input.replaceWith(newH3);
      });
    });
    // description editable
    desc.addEventListener('dblclick', () => {
      const ta = document.createElement('textarea');
      ta.className = 'inline-edit-ta';
      ta.value = desc.textContent;
      desc.replaceWith(ta);
      ta.focus();
      ta.addEventListener('blur', () => {
        const p = document.createElement('p');
        p.className = 'Descripcion';
        p.textContent = ta.value || '';
        ta.replaceWith(p);
      });
    });
  });

  /* Accessibility: allow keyboard on stars (optional) */
  document.addEventListener('keydown', (e) => {
    // simple support: Enter to add new review (if focused on add-review)
    if (document.activeElement === document.getElementById('add-review') && e.key === 'Enter') {
      document.getElementById('add-review').click();
    }
  });

}); // DOMContentLoaded end
