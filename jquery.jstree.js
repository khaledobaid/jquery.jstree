// Author : Khaled Obaid

$.fn.TreeView = function (options)
{
    // Plugin Module Items
    $.fn.TreeView.LoadingImageUrl = options.LoadingImageUrl;
    $.fn.TreeView.Expanded = options.Expanded ? true : false;
    $.fn.TreeView.RTL = options.RTL ? true : false;
    $.fn.TreeView.Container = $(this);
    $.fn.TreeView.Container.addClass("jstree-treeview");
    $.fn.TreeView.OnNodeExpanding = options.OnNodeExpanding;
    $.fn.TreeView.OnNodeClick = options.OnNodeClick;
    $.fn.TreeView.Data = options.Data;


    $.fn.TreeView.PopulateData = function (Parent, NodeObject, Level)
    {
        Level++;
        var visible = (!$.fn.TreeView.Expanded && Level > 1) ? "style='display:none'" : "";
        var list = $("<ul " + visible + " data-level='" + Level + "' class='jstree-treeview-list'></ul>");
        for (var i = 0; i < NodeObject.length; i++)
        {
            var li = $("<li></li>");

            // Populate Attributes
            if (NodeObject[i].Attributes != undefined && NodeObject[i].Attributes != null)
            {
                $.each(NodeObject[i].Attributes, function (index, property)
                {
                    $(li).attr("data-" + index.toString().toLowerCase(), property);
                });
            }


            // Prepare Item Tools
            var expander = $("<span style='display:none' class='jstree-treeview-expander glyphicon glyphicon-plus'>&nbsp;</span>");
            li.append(expander);

            var title = $("<span class='jstree-treeview-title'>" + NodeObject[i].Title + "</span>");
            li.append(title);

            var loader = $("<img style='display:none' class='jstree-treeview-loader' src='" + $.fn.TreeView.LoadingImageUrl + "' />");
            li.append(loader);


            // Add Item To The List
            $(li).appendTo(list);


            var hasChildren = (NodeObject[i].Data != undefined);
            var isLazy = (NodeObject[i].LazyLoading);


            if (hasChildren || isLazy)
            {
                // Add Expander
                expander.show();
                $(expander).click(function ()
                {
                    var list = $(this).parent();

                    if (!list.hasClass("jstree-treeview-expanded"))
                    {
                        if (!list.hasClass("jstree-treeview-expanding"))
                        {
                            list.addClass("jstree-treeview-expanding");

                            if (list.children('.jstree-treeview-list').hasClass("jstree-treeview-loaded"))
                            {
                                // Items is already loaded
                                Expand(list);
                            }
                            else
                            {
                                if ($.fn.TreeView.OnNodeExpanding != undefined)
                                {
                                    list.children(".jstree-treeview-loader").show();

                                    var Level = $(list).children(".jstree-treeview-list").data("level");
                                    // Remove Previous List In Case
                                    $(list).children(".jstree-treeview-list").remove();

                                    var Id = $(list).data("id");
                                    var Title = $(list).children(".jstree-treeview-title").html();
                                    var Attributes = $(list).data();
                                    var nodeObject = { Id: Id, Title: Title, Attributes: Attributes, Data: null };

                                    $.fn.TreeView.OnNodeExpanding(nodeObject);

                                    nodeObject.Complete = function ()
                                    {
                                        list.children(".jstree-treeview-loader").hide();

                                        if (nodeObject.Data != undefined)
                                            $.fn.TreeView.PopulateData(list, nodeObject.Data, Level - 1);

                                        Expand(list);
                                    };
                                }
                                else
                                {
                                    // Items may not loaded but we have to expand
                                    Expand(list);
                                }
                                list.children('.jstree-treeview-list').addClass("jstree-treeview-loaded")
                            }
                        }
                    }
                    else
                    {
                        // Node is already expanded, collapse it
                        Collapse(list);
                    }
                });

                function Expand(list)
                {
                    list.children('.jstree-treeview-list').show();
                    list.children(".jstree-treeview-expander").addClass("glyphicon-minus");
                    list.children(".jstree-treeview-expander").removeClass("glyphicon-plus");
                    list.addClass("jstree-treeview-expanded");
                    list.removeClass("jstree-treeview-expanding");
                }

                function Collapse(list)
                {
                    list.children('.jstree-treeview-list').hide();
                    list.children(".jstree-treeview-expander").addClass("glyphicon-plus");
                    list.children(".jstree-treeview-expander").removeClass("glyphicon-minus");
                    list.children('.jstree-treeview-list').hide();
                    list.removeClass("jstree-treeview-expanded");
                }
            }

            $(title).click(function ()
            {
                var list = $(this).parent();
                var Level = $(list).children(".jstree-treeview-list").data("level");
                var Id = $(list).data("id");
                var Title = $(list).children(".jstree-treeview-title").html();
                var nodeObject = { Id: Id, Title: Title, Data: null };

                $.fn.TreeView.OnNodeClick(nodeObject);
            });



            // Recursively Loop Through
            if (hasChildren)
            {
                $.fn.TreeView.PopulateData(li, NodeObject[i].Data, Level);
            }
        }

        // Handle Right To Left
        if ($.fn.TreeView.RTL)
            $(list).addClass("jstree-treeview-rtl");

        if (Parent == null)
        {
            // This is the root
            $(list).appendTo($($.fn.TreeView.Container));
        }
        else
        {
            $(list).appendTo(Parent);
        }
    }

    // Main Logic

    if (options.Data != undefined && options.Data != null)
    {
        // Loop Through JSON
        $.fn.TreeView.PopulateData(null, options.Data, 0);


        return;


        var loader = $("<div style='display:none' class='jstree-treeview-loader'><img src='" + options.LoadingImageUrl + "' /></div>");
        var expander = $("<div style='display:none' class='jstree-treeview-expander glyphicon glyphicon-plus'>&nbsp;</div>");
        var viewer = $("<div class='jstree-treeview-title'>" + options.Data[0].Title + "</div>");
        var container = $("<div class='jstree-treeview-node' " + ((options.Data[0].Id != undefined) ? "data-id='" + options.Data[0].Id + "'" : "") + "></div>")



        $(expander).appendTo(container);
        $(viewer).appendTo(container);
        $(loader).appendTo(container);

        if (options.RTL)
        {
            $(container).addClass("jstree-treeview-float-rtl");
            $(container).children().addClass("jstree-treeview-float-rtl");
        }

        $(container).appendTo(this);

        if (options.Data[0].Lazy)
        {
            $(expander).show();

            $(expander).click(function ()
            {
                var parentContainer = $(this).parent();

                if (!parentContainer.hasClass("jstree-treeview-expanded"))
                {
                    if (!parentContainer.hasClass("jstree-treeview-expanding"))
                    {
                        parentContainer.addClass("jstree-treeview-expanding");

                        if (parentContainer.children('.jstree-treeview-list').length > 0)
                        {
                            // Items is already loaded
                            parentContainer.children('.jstree-treeview-list').show();
                            parentContainer.children(".jstree-treeview-expander").addClass("glyphicon-minus");
                            parentContainer.children(".jstree-treeview-expander").removeClass("glyphicon-plus");
                            parentContainer.removeClass("jstree-treeview-expanding");
                            parentContainer.addClass("jstree-treeview-expanded");
                        }
                        else
                        {
                            if (options.OnNodeExpanding != undefined)
                            {
                                $(loader).show();

                                var nodeObject = { Id: $(parentContainer[0]).data("id") };
                                options.OnNodeExpanding(nodeObject);

                                nodeObject.Complete = function ()
                                {
                                    $(loader).hide();

                                    if (nodeObject.Data != undefined)
                                    {
                                        var listHtml = "<ul class='jstree-treeview-list'>";
                                        for (var i = 0; i < nodeObject.Data.length; i++)
                                        {
                                            listHtml += "<li>" + nodeObject.Data[i].Title + "</li>";
                                        }
                                        listHtml += "</ul>";

                                        if (options.RTL)
                                            $(listHtml).addClass("jstree-treeview-float-rtl");

                                        $(listHtml).appendTo(parentContainer);
                                    }


                                    parentContainer.addClass("jstree-treeview-expanded");
                                    parentContainer.children(".jstree-treeview-expander").addClass("glyphicon-minus");
                                    parentContainer.children(".jstree-treeview-expander").removeClass("glyphicon-plus");
                                    parentContainer.removeClass("jstree-treeview-expanding");
                                };
                            }
                            else
                            {
                                parentContainer.addClass("jstree-treeview-expanded");
                                parentContainer.children(".jstree-treeview-expander").addClass("glyphicon-minus");
                                parentContainer.children(".jstree-treeview-expander").removeClass("glyphicon-plus");
                                parentContainer.removeClass("jstree-treeview-expanding");
                            }
                        }
                    }
                }
                else
                {
                    // Node is already expanded, collapse it
                    parentContainer.removeClass("jstree-treeview-expanded");
                    parentContainer.children(".jstree-treeview-expander").addClass("glyphicon-plus");
                    parentContainer.children(".jstree-treeview-expander").removeClass("glyphicon-minus");
                    parentContainer.children('.jstree-treeview-list').hide();
                }



            });
        }

        //$(viewer).click(function () { $(expander).click(); });

    }



};


