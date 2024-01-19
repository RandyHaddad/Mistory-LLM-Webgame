document.addEventListener('DOMContentLoaded', function() {
    // Retrieve initial questions asked count from the HTML data attribute
    const initialQuestionsAsked = document.body.getAttribute('data-questions-asked');
    localStorage.setItem('questions_asked', initialQuestionsAsked);

    // Function to toggle dark mode
    function toggleDarkMode(isDarkMode) {
        var body = document.body;
        var switchInput = document.getElementById('darkModeSwitch').querySelector('input');
        body.classList.toggle('dark-mode', isDarkMode);
        switchInput.checked = isDarkMode;
    }

    // Event listener for dark mode toggle switch
    var darkModeSwitch = document.getElementById('darkModeSwitch').querySelector('input');
    darkModeSwitch.addEventListener('change', function(event){
        toggleDarkMode(event.target.checked);
        localStorage.setItem('darkMode', event.target.checked);
    });

    // Apply dark mode state on page load
    toggleDarkMode(localStorage.getItem('darkMode') === 'true');

    // Collapsible sections logic
    var collapsibles = document.querySelectorAll('.collapsible-header');
    collapsibles.forEach(function(collapsible) {
        collapsible.addEventListener('click', function() {
            var content = this.nextElementSibling;
            var isExpanded = content.style.display === 'block';
            content.style.display = isExpanded ? 'none' : 'block';
            this.querySelector('.expand-icon').textContent = isExpanded ? '...' : '▲';
        });
    });

    // Modal logic
    var modal = document.getElementById('answerModal');
    var btn = document.getElementById('checkAnswerButton');
    var span = document.getElementsByClassName('close')[0];

    // Open modal
    btn.onclick = function() {
        modal.style.display = 'block';
    };

    // Close modal on x click
    span.onclick = function() {
        modal.style.display = 'none';
    };

    // Close modal on outside click
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // AJAX form submission logic
    var answerForm = document.getElementById('answerForm');
    answerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var formData = new FormData(this);

        fetch(answerForm.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide the submit answer section
            document.getElementById('submitAnswerSection').style.display = 'none';
            
            // Populate and show the result section
            var resultSection = document.getElementById('resultSection');
            resultSection.innerHTML = `
                <div class="thermometer-container">
                    <div class="thermometer">
                        <div class="temperature" style="height: ${data.accuracy_rating}%;"></div>
                    </div>
                    <div class="temperature-label">${data.accuracy_rating}%</div>
                </div>
                <div class="solution-visualization">
                    <img src="${data.solution_image_url}" alt="Solution Visualization">
                </div>
                <div class="solution-text">
                    <h3>Full Solution</h3>
                    <p>${data.solution_text}</p>
                </div>
            `;
            resultSection.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
    });

    // Update questions left count
    updateQuestionsLeft();
    
    // Function to open the ad modal
    function openAdModal() {
        const adModal = document.getElementById('adModal');
        adModal.style.display = 'block';
    }

        // Function to close the ad modal
        function closeModal() {
            const adModal = document.getElementById('adModal');
            adModal.style.display = 'none';
        }
    
        // Event listener for the "Get More Questions" button
        const getMoreQuestionsBtn = document.getElementById('getMoreQuestionsButton');
        if (getMoreQuestionsBtn) {
            getMoreQuestionsBtn.addEventListener('click', openAdModal);
        }
    
        // Event listener for the "Skip Ad" button
        const skipAdButton = document.getElementById('skipAdButton');
        if (skipAdButton) {
            skipAdButton.addEventListener('click', function() {
                localStorage.setItem('questions_asked', '0');
                updateQuestionsLeft();
                closeModal();
            });
        }
    
        // Get the <span> element that closes the ad modal and add event listener
        const closeAdSpan = document.querySelector('#adModal .close');
        if (closeAdSpan) {
            closeAdSpan.addEventListener('click', closeModal);
        }
    
        // Event listener to close ad modal when clicking outside of it
        window.addEventListener('click', function(event) {
            const adModal = document.getElementById('adModal');
            if (event.target === adModal) {
                closeModal();
            }
        });
    
        // Initial update for questions left
        updateQuestionsLeft();
    // Function to update the number of questions left in the info bar
    
    function updateQuestionsLeft() {
        const questionsLeft = 15 - parseInt(localStorage.getItem('questions_asked') || '0');
        document.querySelector('.info-bar .questions-left').textContent = `${questionsLeft}`;
    }

});
