document.addEventListener('DOMContentLoaded', init);

function init() {
    const albumsContainer = document.getElementById('albumsContainer');
    const photoInput = document.getElementById('photoInput');
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const fullscreenImage = document.getElementById('fullscreenImage');
    const addPhotoBtn = document.getElementById('addPhotoBtn');
     const userInputContainer = document.getElementById('userInputContainer'); // Novo elemento HTML

    // Load saved albums and photos
    loadAlbums();

    addPhotoBtn.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', handlePhotoInputChange);

    function handlePhotoInputChange(event) {
        try {
            const files = event.target.files;
            const albumName = prompt("Para qual álbum você deseja adicionar essas fotos? (Deixe em branco para adicionar à página)");

            if (albumName !== null) {
                if (albumName === '') {
                    // Add photos directly to the page
                    addPhotos(files, albumsContainer);
                } else {
                    // Add photos to a specific album
                    const album = document.querySelector(`.album[data-album="${albumName}"] .photos`);
                    if (album) {
                        addPhotos(files, album);
                    } else {
                        alert(`Álbum "${albumName}" não encontrado.`);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao adicionar fotos:', error);
            alert('Ocorreu um erro ao adicionar as fotos. Por favor, tente novamente.');
        } finally {
            photoInput.value = '';
        }
    }

    function addPhotos(files, container) {
        const existingImages = new Set();

        // Collect existing images to avoid duplicates
        container.querySelectorAll('.photo img').forEach(img => {
            existingImages.add(img.src);
        });

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (!existingImages.has(e.target.result)) {
                    createPhotoElement(e.target.result, container);
                }
            }
            reader.readAsDataURL(file);
        }
    }

    function createPhotoElement(src, container) {
        const img = document.createElement('img');
        img.src = src;
        img.onclick = () => openFullscreen(src);

        const photoDiv = document.createElement('div');
        photoDiv.className = 'photo';
        photoDiv.appendChild(img);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => deletePhoto(deleteBtn);
        photoDiv.appendChild(deleteBtn);

        container.appendChild(photoDiv);
        saveAlbums();
    }

    function createAlbum(albumName, files = []) {
        try {
            if (!albumName) {
                albumName = prompt("Digite o nome do novo álbum:");
            }

            if (albumName) {
                const albumExists = document.querySelector(`.album[data-album="${albumName}"]`);

                if (!albumExists) {
                    const albumDiv = document.createElement('div');
                    albumDiv.className = 'album';
                    albumDiv.setAttribute('data-album', albumName);

                    const albumTitle = document.createElement('div');
                    albumTitle.className = 'album-title';
                    albumTitle.textContent = albumName;

                    const deleteAlbumBtn = document.createElement('button');
                    deleteAlbumBtn.className = 'delete-album-btn';
                    deleteAlbumBtn.textContent = 'Excluir Álbum';
                    deleteAlbumBtn.onclick = () => deleteAlbum(albumDiv);
                    albumTitle.appendChild(deleteAlbumBtn);

                    albumDiv.appendChild(albumTitle);

                    const photosDiv = document.createElement('div');
                    photosDiv.className = 'photos';
                    albumDiv.appendChild(photosDiv);

                    albumsContainer.appendChild(albumDiv);
                    saveAlbums();

                    if (files.length > 0) {
                        addPhotos(files, photosDiv);
                    }
                } else {
                    alert(`Álbum "${albumName}" já existe.`);
                }
            }
        } catch (error) {
            console.error('Erro ao criar álbum:', error);
            alert('Ocorreu um erro ao criar o álbum. Por favor, tente novamente.');
        }
    }

    function deleteAlbum(albumDiv) {
        try {
            albumsContainer.removeChild(albumDiv);
            saveAlbums();
        } catch (error) {
            console.error('Erro ao deletar álbum:', error);
            alert('Ocorreu um erro ao deletar o álbum. Por favor, tente novamente.');
        }
    }

    function deletePhoto(button) {
        try {
            const photoDiv = button.parentNode;
            photoDiv.parentNode.removeChild(photoDiv);
            saveAlbums();
        } catch (error) {
            console.error('Erro ao deletar foto:', error);
            alert('Ocorreu um erro ao deletar a foto. Por favor, tente novamente.');
        }
    }

    function openFullscreen(src) {
        try {
            fullscreenImage.src = src;
            fullscreenOverlay.style.display = 'flex';
        } catch (error) {
            console.error('Erro ao abrir foto em tela cheia:', error);
            alert('Ocorreu um erro ao abrir a foto em tela cheia. Por favor, tente novamente.');
        }
    }

    function closeFullscreen() {
        try {
            fullscreenOverlay.style.display = 'none';
        } catch (error) {
            console.error('Erro ao fechar foto em tela cheia:', error);
            alert('Ocorreu um erro ao fechar a foto em tela cheia. Por favor, tente novamente.');
        }
    }

    function searchPhotos() {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const albums = document.querySelectorAll('.album');

        albums.forEach(album => {
            const albumTitle = album.querySelector('.album-title').textContent.toLowerCase();
            const photos = album.querySelectorAll('.photo');
            let albumMatch = albumTitle.includes(searchInput);

            photos.forEach(photo => {
                const img = photo.querySelector('img');
                const imgSrc = img.src.toLowerCase();
                const photoMatch = imgSrc.includes(searchInput);
                photo.style.display = photoMatch || albumMatch ? '' : 'none';
            });

            album.style.display = albumMatch || Array.from(photos).some(photo => photo.style.display === '') ? '' : 'none';
        });
    }

    function saveAlbums() {
        const albums = [];
        document.querySelectorAll('.album').forEach(album => {
            const albumData = {
                name: album.getAttribute('data-album'),
                photos: Array.from(album.querySelectorAll('.photo img')).map(img => img.src)
            };
            albums.push(albumData);
        });
        localStorage.setItem('albums', JSON.stringify(albums));
    }

    function loadAlbums() {
        const savedAlbums = JSON.parse(localStorage.getItem('albums'));
        if (savedAlbums) {
            savedAlbums.forEach(albumData => {
                const albumDiv = document.createElement('div');
                albumDiv.className = 'album';
                albumDiv.setAttribute('data-album', albumData.name);

                const albumTitle = document.createElement('div');
                albumTitle.className = 'album-title';
                albumTitle.textContent = albumData.name;

                const deleteAlbumBtn = document.createElement('button');
                deleteAlbumBtn.className = 'delete-album-btn';
                deleteAlbumBtn.textContent = 'Excluir Álbum';
                deleteAlbumBtn.onclick = () => deleteAlbum(albumDiv);
                albumTitle.appendChild(deleteAlbumBtn);

                albumDiv.appendChild(albumTitle);

                const photosDiv = document.createElement('div');
                photosDiv.className = 'photos';
                albumDiv.appendChild(photosDiv);

                albumData.photos.forEach(photoSrc => {
                    createPhotoElement(photoSrc, photosDiv);
                });

                albumsContainer.appendChild(albumDiv);
            });
        }
    }

    // Create button for adding album
    const addAlbumBtn = document.createElement('button');
    addAlbumBtn.id = 'addAlbumBtn';
    addAlbumBtn.textContent = '+';
    addAlbumBtn.onclick = () => createAlbum();
    document.body.appendChild(addAlbumBtn);

    // Expose functions to global scope
    window.createAlbum = createAlbum;
    window.openFullscreen = openFullscreen;
    window.closeFullscreen = closeFullscreen;
    window.searchPhotos = searchPhotos;
}
