document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.getElementById('envelope');
    const envelopeSection = document.getElementById('envelope-section');
    const puzzleSection = document.getElementById('puzzle-section');
    const proposalSection = document.getElementById('proposal-section');
    const successSection = document.getElementById('success-section');

    const sections = [envelopeSection, puzzleSection, proposalSection, successSection];

    function showSection(targetSection) {
        sections.forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });
        targetSection.style.display = 'flex';
        // Force reflow
        targetSection.offsetHeight;
        targetSection.classList.add('active');
    }

    // 1. Envelope Opening
    envelope.addEventListener('click', () => {
        envelope.classList.add('open');
        setTimeout(() => {
            showSection(puzzleSection);
            initPuzzle();
        }, 1500);
    });

    // 2. Puzzle Logic
    const puzzleContainer = document.getElementById('puzzle-container');
    const imagePath = 'Assets/Picture.PNG';
    let pieces = [];
    const gridSize = 3;
    let puzzleSolved = false;

    function initPuzzle() {
        const positions = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            positions.push(i);
        }

        // Shuffle positions
        positions.sort(() => Math.random() - 0.5);

        puzzleContainer.innerHTML = '';
        pieces = [];

        for (let i = 0; i < gridSize * gridSize; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.draggable = true;

            const targetPos = positions[i];
            const x = (targetPos % gridSize) * 100;
            const y = Math.floor(targetPos / gridSize) * 100;

            piece.style.backgroundImage = `url(${imagePath})`;
            piece.style.backgroundPosition = `-${x}px -${y}px`;
            piece.dataset.correctPos = targetPos;

            console.log(`Piece ${i} created with correctPos: ${targetPos} (BG: -${x}px -${y}px)`);

            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragover', handleDragOver);
            piece.addEventListener('drop', handleDrop);

            puzzleContainer.appendChild(piece);
            pieces.push(piece);
        }
        checkPuzzle(); // Check initially in case it naturally starts solved or near-solved
    }

    let draggedPiece = null;

    function handleDragStart(e) {
        draggedPiece = this;
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        if (this === draggedPiece) return;

        const draggedBg = draggedPiece.style.backgroundPosition;
        const draggedCorrectPos = draggedPiece.dataset.correctPos;

        draggedPiece.style.backgroundPosition = this.style.backgroundPosition;
        draggedPiece.dataset.correctPos = this.dataset.correctPos;

        this.style.backgroundPosition = draggedBg;
        this.dataset.correctPos = draggedCorrectPos;

        checkPuzzle();
    }

    function checkPuzzle() {
        if (puzzleSolved) return;
        const currentPieces = Array.from(puzzleContainer.children);
        let correctCount = 0;

        currentPieces.forEach((piece, index) => {
            const isCorrect = parseInt(piece.dataset.correctPos) === index;
            if (isCorrect) {
                piece.classList.add('correct');
                correctCount++;
            } else {
                piece.classList.remove('correct');
            }
        });

        console.log(`Puzzle Progress: ${correctCount}/${currentPieces.length} correct`);

        if (correctCount === currentPieces.length) {
            puzzleSolved = true;
            console.log("PUZZLE SOLVED - Transitioning...");
            document.getElementById('puzzle-message').classList.remove('hidden');

            // Immediate transition
            setTimeout(() => {
                showSection(proposalSection);
            }, 800);
        }
    }

    // 3. Dodging No Button
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');

    document.addEventListener('mousemove', (e) => {
        if (!proposalSection.classList.contains('active')) return;

        const rect = noBtn.getBoundingClientRect();
        const btnX = rect.left + rect.width / 2;
        const btnY = rect.top + rect.height / 2;

        const dist = Math.hypot(e.clientX - btnX, e.clientY - btnY);

        if (dist < 100) {
            const angle = Math.atan2(e.clientY - btnY, e.clientX - btnX);
            const moveDist = 150;

            let newX = rect.left - Math.cos(angle) * moveDist;
            let newY = rect.top - Math.sin(angle) * moveDist;

            // Keep within viewport
            newX = Math.max(20, Math.min(window.innerWidth - rect.width - 20, newX));
            newY = Math.max(20, Math.min(window.innerHeight - rect.height - 20, newY));

            noBtn.style.position = 'fixed';
            noBtn.style.left = `${newX}px`;
            noBtn.style.top = `${newY}px`;
        }
    });

    yesBtn.addEventListener('click', () => {
        showSection(successSection);
        noBtn.style.display = 'none'; // Ensure No button is gone after yes
    });

    // 4. Skip Puzzle (Troubleshooting)
    const skipBtn = document.getElementById('skip-puzzle');
    skipBtn.addEventListener('click', () => {
        console.log("Puzzle skipped by user");
        showSection(proposalSection);
    });
});

