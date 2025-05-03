<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/rss/channel">
        <html>
            <head>
                <title><xsl:value-of select="title"/></title>
                <link rel="stylesheet" type="text/css" href="/rss-style.css"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body>
                <div class="rss-container">
                    <header class="rss-header">
                        <h1><xsl:value-of select="title"/></h1>
                        <p><xsl:value-of select="description"/></p>
                        <p><a href="{link}" target="_blank"><xsl:value-of select="link"/></a></p>
                    </header>
                    <hr/>
                    <main class="rss-items">
                        <h2>Feed Items</h2>
                        <xsl:apply-templates select="item"/>
                    </main>
                    <footer class="rss-footer">
                        <p>RSS feed generated on: <xsl:value-of select="lastBuildDate"/></p>
                    </footer>
                </div>
            </body>
        </html>
    </xsl:template>

    <xsl:template match="item">
        <article class="rss-item">
            <h3><a href="{link}" target="_blank"><xsl:value-of select="title"/></a></h3>
            <p><xsl:value-of select="description"/></p>
            <p class="rss-pubDate">Published: <xsl:value-of select="pubDate"/></p>
        </article>
    </xsl:template>

</xsl:stylesheet>