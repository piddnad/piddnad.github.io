---
layout: page
title: 归档
permalink: /archives/
---

<div class="post">
  <h1 class="label-title" data-i18n="archives_heading">归档</h1>
  <div class="post-archive">
  {% for post in site.posts  %}
      {% capture this_year %}{{ post.date | date: "%Y" }}{% endcapture %}
      {% capture this_month %}{{ post.date | date: "%B" }}{% endcapture %}
      {% capture this_month_cn %}{{ post.date | date: "%-m" }} 月{% endcapture %}
      {% capture next_year %}{{ post.previous.date | date: "%Y" }}{% endcapture %}
      {% capture next_month %}{{ post.previous.date | date: "%B" }}{% endcapture %}
      {% capture next_month_cn %}{{ post.previous.date | date: "%-m" }} 月{% endcapture %}

      {% if forloop.first %}
        <h2>{{this_year}}</h2>
        <h3><span data-lang-block="zh">{{ this_month_cn }}</span><span data-lang-block="en" style="display:none;">{{ this_month }}</span></h3>
        <ul>
      {% endif %}

      <li>
        <span class="date">
          <span data-lang-block="zh">{{ post.date | date: "%Y/%m/%d" }}</span>
          <span data-lang-block="en" style="display:none;">{{ post.date | date: "%B %e, %Y" }}</span>
        </span>
        <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
      </li>

      {% if forloop.last %}
        </ul>
      {% else %}
        {% if this_year != next_year %}
          </ul>
          <h2>{{next_year}}</h2>
          <h3><span data-lang-block="zh">{{ next_month_cn }}</span><span data-lang-block="en" style="display:none;">{{ next_month }}</span></h3>
          <ul>
        {% else %}    
          {% if this_month != next_month %}
            </ul>
            <h3><span data-lang-block="zh">{{ next_month_cn }}</span><span data-lang-block="en" style="display:none;">{{ next_month }}</span></h3>
            <ul>
          {% endif %}
        {% endif %}
      {% endif %}
  {% endfor %}
  </div>
</div>
