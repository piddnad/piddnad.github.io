---
layout: page
title: Search
permalink: /search
---

<script>
  var key = location.pathname;
  key = key.substring('/search/'.length);
  if (key.indexOf('/') != -1) {
    key = '';
  }
</script>

<span data-i18n="viewing_tag_prefix">正在查看</span> "<span id="search_key"></span>" <span data-i18n="viewing_tag_suffix">下的文章</span>
<script>
  var key_ui = document.getElementById('search_key');
  key_ui.textContent = key;
</script>

<div class="post">
  <div class="post-archive">
  {% for post in site.posts %}
    <ul class="listing" style="display: none;">
      <li>
      <span class="date">{{ post.date | date: "%Y/%m/%d" }}</span>
      <a href="{{ post.url | prepend: site.baseurl }}">
      {% if post.title %}
  		{{ post.title }}
  	  {% else %}
  		{{ site.page_no_title }}
  	  {% endif %}
  	  </a>
  	</li>
    </ul>
  {% endfor %}
  </div>
</div>

<script>
  window.onload=function() {
    var items = $('.post-archive a');
    for (var i=0; i<items.length; i++) {
      var item = items[i];
      if (item.text.toLowerCase().indexOf(key.toLowerCase()) == -1) {
        $(item.parentElement.parentElement).remove();
      } else {
        $(item.parentElement.parentElement).show();
      }
    }
    if ($('.post-archive a').length == 0) {
      var noRecords = '<font color="red"><span data-i18n="no_records">没有记录</span></font>';
      $('.post-archive').html(noRecords)
      if (window.SiteI18n && document.body && document.body.getAttribute('data-lang')) {
        window.SiteI18n.apply(document.body.getAttribute('data-lang'));
      }
    }
  }
</script>
