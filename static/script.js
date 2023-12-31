document.addEventListener('DOMContentLoaded', function() {
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
});
