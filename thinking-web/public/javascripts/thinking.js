stagedTags = [];

$(function(){
    $('#thoughtInput').focus();
    
    $('#thoughtBox').submit(function(event) {
        event.preventDefault();
        
//        addThought($('#thoughtInput').val(), function() {
//            $('#thoughtInput').val('');
//        });
        stageThought();
    });
    
    $('#tagForm').submit(function(event) {
        event.preventDefault();
        
        tagAction();
    });
});

function addThought(text, tags, callback) {
    $.post(
        '/api/thoughts',
        {
            text: text,
            tags: tags
        }
    ).always(function() { 
        callback();
    });
}

function stageThought() {
    $('#thoughtInput').prop('disabled', true);
    
    var text = $('#thoughtInput').val();
    //FIXME: some unnecessary operations here
    var tags = generateTags(text);
    tags.forEach(function(tag) {
        stageTag(tag);
    })
    
    $('#stagedText').text(text);
    $('#stage').css('visibility', 'visible');
    $('#tagInput').focus();
}

function tagAction() {
    var tagText = $('#tagInput').val();
    
    if (tagText == '') {
        addThought($('#stagedText').text(), stagedTags, thoughtAdded);
        unstage();
    } else {
        $('#tagInput').val('');
        stageTag(tagText);
    }
}

function stageTag(tagText) {
    stagedTags.push(tagText);
    
    $('#stagedTags').append('<span class="tag">' + tagText + '</span>');
}

function unstage() {
    $('#stage').css('visibility', 'hidden');
    stagedTags = [];
    $('#stagedText').text('');
    $('#stagedTags').text('');
}

function thoughtAdded() {
    $('#thoughtInput').val('');
    $('#thoughtInput').prop('disabled', false);
    $('#thoughtInput').focus();
}

function generateTags(text) {
    // For now, pull out singularized nouns
    // Exclude pronouns
    var terms = nlp_compromise.text(text).terms();
    var tags = [];
    for (var i = 0; i < terms.length; i++) {
        if (terms[i].pos.Noun && (!terms[i].pos.Pronoun)) {
            if (terms[i].pos.Plural) {
                tags.push(terms[i].singularize());
            } else {
                tags.push(terms[i].text);
            }
        }
    }
    
    return tags;
}