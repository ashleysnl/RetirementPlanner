#!/usr/bin/env python3
"""Bundle relative named ES modules, preserving their private lexical scopes.

This deliberately supports only the repository's checked syntax. Unsupported
imports/exports fail the build instead of silently changing financial behavior.
"""
from pathlib import Path
import json, re
root=Path(__file__).resolve().parent.parent
modules={}
imports=re.compile(r'^import\s+({[^}]+})\s+from\s+[\'"]([^\'"]+)[\'"];[ \t]*$',re.M)
declarations=re.compile(r'^export\s+((?:async\s+)?function|const|let|class)\s+(\w+)',re.M)
def visit(file):
    name=file.relative_to(root).as_posix()
    if name in modules:return name
    modules[name]=''
    source=file.read_text()
    def replace_import(match):
        dependency=match.group(2)
        if not dependency.startswith('.'):raise ValueError('Non-relative dependency: '+dependency)
        target=(file.parent/dependency).resolve()
        if not target.is_relative_to(root):raise ValueError('Dependency outside repository')
        binding=re.sub(r'\s+as\s+',': ',match.group(1))
        return 'const '+binding+' = require('+json.dumps(visit(target))+');'
    source=imports.sub(replace_import,source)
    exports=[m.group(2) for m in declarations.finditer(source)]
    source=declarations.sub(lambda m:m.group(1)+' '+m.group(2),source)
    if re.search(r'^(?:import|export)\s',source,re.M):raise ValueError('Unsupported module syntax: '+name)
    modules[name]=source+'\nreturn {'+', '.join(exports)+'};\n'
    return name
entry=visit(root/'app.js')
parts=['/* Generated from canonical ES modules; private scopes preserved. */\n(function(){\n"use strict";\nconst factories = {\n']
for name,source in sorted(modules.items()):parts.append(json.dumps(name)+': function(require){\n'+source+'},\n')
parts.append('};\nconst cache=Object.create(null);\nfunction require(id){if(cache[id])return cache[id];if(!factories[id])throw Error("Missing module: "+id);const result=factories[id](require);cache[id]=result;return result;}\nrequire('+json.dumps(entry)+');\n})();\n')
(root/'app.classic.js').write_text(''.join(parts))
print('Built scoped fallback from',len(modules),'canonical modules')
