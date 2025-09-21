var timer;
$(document).on('keyup', 'input.search', function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
        var value = $(this).val().toLowerCase();
        $('.search-row:not(.d-none)').filter(function () {
            $(this).toggle($(this).children('.search-field').text().toLowerCase()
                .indexOf(value) > -1);

            if ($(this).children('.search-field').text().toLowerCase()
                .indexOf(value) > -1) {
                let groupClass = $(this).attr('data-group');
                $('.group-row.' + groupClass).show();
            }

        });
    }, 500);
});

$(document).on('click', 'button.change-host', function () {
    var updatedHostName = $('input.host-value').val();
    $('.group-row a').each((a, e) => {
        e.hostname = updatedHostName;
    })
})

$(document).on("click", "div.easy-links a", function () {
    var updatedHostName = $(this).attr("host");
    if (updatedHostName) {
        $(this).toggleClass("linkselected");
    }
});

$(document).on("click", ".group-row a", function (e) {
    e.preventDefault();
    var that = $(this);
    var a = $(".linkselected").length;
    if (a) {
        $(".linkselected").each((a, e) => {
            that[0].hostname = $(e).attr("host");
            window.open(that[0].href, "_blank");
        });
    }
    else {
        window.open(that[0].href, "_blank");
    }
});

$(document).on('click', '.format-button', function () {
    let jsonText = $(this).parent().text().replace('{;}', '').trim();
    try {
        const jsonObject = JSON.parse(jsonText);
        const formattedJSON = JSON.stringify(jsonObject, null, 2);
        $(this).parent().html('<pre>' + formattedJSON + '</pre>');

    } catch (e) {
        alert('Invalid JSON');
    }
});

$(document).tooltip();