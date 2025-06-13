/*
    List Operations
*/

// Get List Data
export async function getAllListData() {
    const res = await fetch("/api/lists");
    const data = await res.json();

    const lists_arr = parseCustomJson(data);

    return sortLists(lists_arr, "list_metadata.order");
}
function parseCustomJson(data) {
    const lists_arr = [];

    data.lists.map((mainList) => {
        mainList = JSON.parse(mainList.main_list);
        lists_arr.push(mainList);
    })
    return lists_arr;
}

// Update List Name 
export async function updateListName(listName, list) {
    list.list_name = listName
    const res = await fetch("/api/items", {
        method: "POST",
        body: JSON.stringify({ blob: list })
    });
}

// Create List 
export async function addList(newList) {
    const res = await fetch("/api/lists/createList", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ list: newList }),
    });
}

// Remove List
export async function removeList(listId) {
    const res = await fetch(`/api/lists/deleteList?listId=${encodeURIComponent(listId)}`, {
        method: "DELETE"
    });
}


// List Order

export async function getListIds(lists_arr) {
    let list_id_arr = []
    lists_arr.forEach((list) => {
        list_id_arr.push(list.list_metadata.list_id);
    });
    return list_id_arr;
}

export async function persistListOrder(lists) {
    let start_order = 1;
    lists.forEach((list) => {
        list.list_metadata.order = start_order;
        start_order++;
    });

    const res = await fetch("/api/lists", {
        method: "POST",
        body: JSON.stringify({ blob: lists })
    });
}

function sortLists(lists, attributePath) {
    return lists.sort((a, b) => {
        let aValue = a;
        let bValue = b;

        for (const key of attributePath.split('.')) {

            aValue = aValue[key];
            bValue = bValue[key];
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
    });
}



/*
    List Item Operations
*/ 

// Update Items in a List
export async function updateListItems(items, list) {
    const items_to_save = items.map((item) => {
        return {
            item_data: { text: item.text, checked: item.done },
            item_metadata: { item_id: item.id }
        }
    })
    list.list_data = items_to_save

    const res = await fetch("/api/items", {
        method: "POST",
        body: JSON.stringify({ blob: list })
    })
}

