const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY;
const tableName = import.meta.env.VITE_SUPABASE_LEARNING_TABLE || 'interview_qa';
const labelsTableName = import.meta.env.VITE_SUPABASE_LEARNING_LABELS_TABLE || 'learning_bookmark_labels';
const labelAssignmentsTableName = import.meta.env.VITE_SUPABASE_LEARNING_LABEL_ASSIGNMENTS_TABLE || 'learning_bookmark_label_assignments';

function assertConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in archelon-learning/.env');
  }
}

async function request(path, options = {}) {
  assertConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${details}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function isMissingSchemaError(error, name) {
  return error.message.includes('42P01') || error.message.includes(`${name}" does not exist`);
}

export async function fetchInterviewQuestions() {
  const query = [
    'select=id,course_name,order_index,question,answer,module,category,tags,mark_as_complete,bookmark,notes',
    'order=course_name.asc,order_index.asc',
  ].join('&');
  return request(`${tableName}?${query}`);
}

export async function fetchBookmarkLabels() {
  const query = [
    'select=id,name,color,sort_order',
    'order=sort_order.asc,name.asc',
  ].join('&');
  try {
    return await request(`${labelsTableName}?${query}`);
  } catch (error) {
    if (!isMissingSchemaError(error, labelsTableName)) throw error;
    return [];
  }
}

export async function fetchBookmarkLabelByName(name) {
  const encodedName = encodeURIComponent(name);
  const query = [
    'select=id,name,color,sort_order',
    `name=eq.${encodedName}`,
    'limit=1',
  ].join('&');
  const rows = await request(`${labelsTableName}?${query}`);
  return Array.isArray(rows) ? rows[0] || null : rows;
}

export async function fetchBookmarkLabelAssignments() {
  const query = [
    'select=question_id,label_id',
    'order=created_at.asc',
  ].join('&');
  try {
    return await request(`${labelAssignmentsTableName}?${query}`);
  } catch (error) {
    if (!isMissingSchemaError(error, labelAssignmentsTableName)) throw error;
    return [];
  }
}

export async function createBookmarkLabel(label) {
  const rows = await request(labelsTableName, {
    method: 'POST',
    body: JSON.stringify(label),
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function addBookmarkLabelAssignment(questionId, labelId) {
  try {
    const rows = await request(labelAssignmentsTableName, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, label_id: labelId }),
      headers: {
        Prefer: 'resolution=ignore-duplicates,return=representation',
      },
    });
    return Array.isArray(rows) ? rows[0] : rows;
  } catch (error) {
    if (!isMissingSchemaError(error, labelAssignmentsTableName)) throw error;
    return null;
  }
}

export async function removeBookmarkLabelAssignment(questionId, labelId) {
  const encodedQuestionId = encodeURIComponent(questionId);
  const encodedLabelId = encodeURIComponent(labelId);
  try {
    return await request(`${labelAssignmentsTableName}?question_id=eq.${encodedQuestionId}&label_id=eq.${encodedLabelId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (!isMissingSchemaError(error, labelAssignmentsTableName)) throw error;
    return null;
  }
}

export async function removeBookmarkLabelAssignmentsByLabel(labelId) {
  const encodedLabelId = encodeURIComponent(labelId);
  try {
    return await request(`${labelAssignmentsTableName}?label_id=eq.${encodedLabelId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (!isMissingSchemaError(error, labelAssignmentsTableName)) throw error;
    return null;
  }
}

export async function deleteBookmarkLabel(labelId) {
  const encodedLabelId = encodeURIComponent(labelId);
  const rows = await request(`${labelsTableName}?id=eq.${encodedLabelId}`, {
    method: 'DELETE',
  });
  return rows;
}

export async function createInterviewQuestions(rows) {
  const inserted = await request(tableName, {
    method: 'POST',
    body: JSON.stringify(rows),
  });
  return Array.isArray(inserted) ? inserted : [inserted].filter(Boolean);
}

export async function deleteInterviewQuestion(id) {
  const encodedId = encodeURIComponent(id);
  return request(`${tableName}?id=eq.${encodedId}`, {
    method: 'DELETE',
  });
}

export async function deleteInterviewQuestionsByCourse(courseName) {
  const encodedCourseName = encodeURIComponent(courseName);
  return request(`${tableName}?course_name=eq.${encodedCourseName}`, {
    method: 'DELETE',
  });
}

export async function updateInterviewQuestionsByCourse(courseName, patch) {
  const encodedCourseName = encodeURIComponent(courseName);
  const rows = await request(`${tableName}?course_name=eq.${encodedCourseName}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return Array.isArray(rows) ? rows : [rows].filter(Boolean);
}

export async function updateInterviewQuestion(id, patch) {
  const encodedId = encodeURIComponent(id);
  const rows = await request(`${tableName}?id=eq.${encodedId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return Array.isArray(rows) ? rows[0] : rows;
}
