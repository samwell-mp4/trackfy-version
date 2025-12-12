const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- Checklists ---

async function listChecklists(userId, relatedEntityType = null, relatedEntityId = null) {
    let query = supabase
        .from('checklists')
        .select('*, tasks(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (relatedEntityType) {
        query = query.eq('related_entity_type', relatedEntityType);
    }
    if (relatedEntityId) {
        query = query.eq('related_entity_id', relatedEntityId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function createChecklist(userId, checklistData) {
    const { data, error } = await supabase
        .from('checklists')
        .insert([{ ...checklistData, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteChecklist(userId, checklistId) {
    const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklistId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
}

// --- Tasks ---

async function createTask(userId, taskData) {
    // Verify checklist ownership first
    const { data: checklist, error: checkError } = await supabase
        .from('checklists')
        .select('user_id')
        .eq('id', taskData.checklist_id)
        .single();

    if (checkError || !checklist || checklist.user_id !== userId) {
        throw new Error('Checklist not found or access denied');
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateTask(userId, taskId, updates) {
    // We need to join with checklist to verify ownership, but Supabase update doesn't support joins directly in the filter easily for permissions without RLS.
    // Assuming RLS is not fully set up or we trust the app logic. 
    // Ideally, we fetch the task -> checklist -> user_id check.

    const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('checklist_id, checklists(user_id)')
        .eq('id', taskId)
        .single();

    if (fetchError || !task || task.checklists.user_id !== userId) {
        throw new Error('Task not found or access denied');
    }

    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteTask(userId, taskId) {
    const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('checklist_id, checklists(user_id)')
        .eq('id', taskId)
        .single();

    if (fetchError || !task || task.checklists.user_id !== userId) {
        throw new Error('Task not found or access denied');
    }

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) throw error;
    return true;
}

module.exports = {
    listChecklists,
    createChecklist,
    deleteChecklist,
    createTask,
    updateTask,
    deleteTask
};
