document.addEventListener('DOMContentLoaded', function() {

    // Set the solution details from data attributes
    window.solutionDetails = {
        imageUrl: document.body.getAttribute('data-solution-image'),
        text: document.body.getAttribute('data-solution-text')
    };

    function adjustBodyHeight() {
        document.body.style.height = 'auto';
        if (window.innerHeight < document.body.scrollHeight) {
            document.body.style.height = document.body.scrollHeight + 'px';
        }
    }
    
    // Run the function on load and on resize
    adjustBodyHeight();
    window.addEventListener('resize', adjustBodyHeight);
    
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
            this.classList.toggle('expanded', !isExpanded);
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

    // Function to update tip message
    function updateTipMessage(temperature) {
        const tipMessageDiv = document.getElementById('tipMessage');
        if (temperature < 20) {
            tipMessageDiv.textContent = "That's chilly. Keep asking.";
        } else if (temperature < 40) {
            tipMessageDiv.textContent = "Still far. Try again.";
        } else if (temperature < 60) {
            tipMessageDiv.textContent = "Could do better. Think.";
        } else if (temperature < 80) {
            tipMessageDiv.textContent = "Getting close. Push further.";
        } else if (temperature < 90) {
            tipMessageDiv.textContent = "Burning. What's missing?";
        } else if (temperature === 100) {
            tipMessageDiv.textContent = "That's it! You got it.";
        }
    }

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
            // Update the thermometer
            var temperatureValue = parseInt(data.accuracy_rating);
            var temperatureDiv = document.getElementById('temperature');
            temperatureDiv.style.height = `${data.accuracy_rating}%`;
            temperatureDiv.dataset.value = data.accuracy_rating + "°C"; // Assuming Celcius for now

            updateTipMessage(temperatureValue); // Update the tip message based on temperature
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });        
    var seeSolution = document.getElementById('seeSolutionButton');
    seeSolution.addEventListener('click', function() {

        // Populate and show the solution modal
        var solutionModal = document.getElementById('solutionModal');
        solutionModal.querySelector('.solution-visualization img').src = window.solutionDetails.imageUrl;
        solutionModal.querySelector('.solution-text p').textContent = window.solutionDetails.text;
        solutionModal.style.display = 'block';
    });
    
    // Add close functionality to the solution modal
    var solutionModal = document.getElementById('solutionModal');
    var solutionModalClose = solutionModal.querySelector('.close');
    solutionModalClose.addEventListener('click', function() {
        solutionModal.style.display = 'none';
    });
    
    // Combined Modal Closing Logic
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
        if (event.target === solutionModal) {
            solutionModal.style.display = 'none';
            modal.style.display = 'none';
        }
        if (event.target === adModal) {
            adModal.style.display = 'none';
        }
    };
    
    // Close Button for Answer Modal
    var spanAnswerModal = modal.getElementsByClassName('close')[0];
    spanAnswerModal.onclick = function() {
        modal.style.display = 'none';
    };
    
    // Close Button for Solution Modal
    var spanSolutionModal = solutionModal.getElementsByClassName('close')[0];
    spanSolutionModal.onclick = function() {
        solutionModal.style.display = 'none';
    };
    
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
