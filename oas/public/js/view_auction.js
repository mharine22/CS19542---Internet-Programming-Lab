document.addEventListener("DOMContentLoaded", function() {
    // Fetch auction items from the server
    fetch('/api/auction_items') // Ensure this API endpoint returns your auction items
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Auction Items Data:', data); // Log the fetched auction items
            const auctionItemsContainer = document.getElementById('auction-items');
            auctionItemsContainer.innerHTML = ''; // Clear existing items

            // Populate auction items
            data.forEach(item => {
                const itemCard = `
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="/${item.image_path}" class="card-img-top" alt="${item.name}">
                            <div class="card-body">
                                <h5 class="card-title">${item.name}</h5>
                                <p class="card-text">${item.description}</p>
                                <p class="card-text"><strong>Starting Price:</strong> $${item.starting_price}</p>
                                <a href="/bid?id=${item.id}" class="btn btn-primary">Place a Bid</a>
                            </div>
                        </div>
                    </div>
                `;
                auctionItemsContainer.insertAdjacentHTML('beforeend', itemCard);
            });
        })
        .catch(error => console.error('Error fetching auction items:', error));

    // Fetch bids for auction items from the server
    fetch('/api/bids') // Ensure this API endpoint returns the bids for the items
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Bids Data:', data); // Log the fetched bids
            const bidsListContainer = document.getElementById('bids-list');
            bidsListContainer.innerHTML = ''; // Clear existing bids

            // Populate bids
            data.forEach(bid => {
                const bidItem = `
                    <li class="list-group-item">${bid.username} - $${bid.amount} - ${new Date(bid.timestamp).toLocaleString()}</li>
                `;
                bidsListContainer.insertAdjacentHTML('beforeend', bidItem);
            });
        })
        .catch(error => console.error('Error fetching bids:', error));
});
